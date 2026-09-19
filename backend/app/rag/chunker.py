import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    document_id: str
    text: str
    page_number: int | None
    section: str | None


SECTION_PATTERN = re.compile(r"^(?:\d+\.?\s+)?([A-Z][A-Za-z ]{3,60})$", re.MULTILINE)
PAGE_PATTERN = re.compile(r"\[Page (\d+)\]")


def chunk_text(document_id: str, text: str, chunk_size: int = 900, overlap: int = 120) -> list[Chunk]:
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[Chunk] = []
    buffer = ""
    page_number: int | None = None
    section: str | None = None

    def flush() -> None:
        nonlocal buffer
        if buffer.strip():
            chunks.append(
                Chunk(
                    chunk_id=f"{document_id}-{len(chunks) + 1}",
                    document_id=document_id,
                    text=buffer.strip(),
                    page_number=page_number,
                    section=section,
                )
            )
            buffer = buffer[-overlap:] if overlap and len(buffer) > overlap else ""

    for paragraph in paragraphs:
        page_match = PAGE_PATTERN.search(paragraph)
        if page_match:
            page_number = int(page_match.group(1))
        section_match = SECTION_PATTERN.match(paragraph.strip())
        if section_match:
            section = section_match.group(1).strip()
        if len(buffer) + len(paragraph) + 2 > chunk_size:
            flush()
        buffer = f"{buffer}\n\n{paragraph}".strip()
    flush()
    return chunks
