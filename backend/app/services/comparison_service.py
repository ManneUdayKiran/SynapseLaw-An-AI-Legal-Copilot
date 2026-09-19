import difflib

from app.rag.chunker import chunk_text
from app.schemas.analysis import CompareResponse, ComparisonChange, SourceRef
from app.db.models import Document


WATCH_TERMS = ["termination", "payment", "deadline", "penalty", "liability", "renewal", "confidential"]


def compare_documents(document_a: Document, document_b: Document) -> CompareResponse:
    chunks_a = chunk_text(document_a.id, document_a.extracted_text)
    chunks_b = chunk_text(document_b.id, document_b.extracted_text)
    text_a = "\n".join(chunk.text for chunk in chunks_a)
    text_b = "\n".join(chunk.text for chunk in chunks_b)
    changes: list[ComparisonChange] = []

    for term in WATCH_TERMS:
        line_a = _best_line(text_a, term)
        line_b = _best_line(text_b, term)
        if line_a != line_b and (line_a or line_b):
            changes.append(
                ComparisonChange(
                    category=term.title(),
                    document_a=line_a or "Not found in Document A",
                    document_b=line_b or "Not found in Document B",
                    change=_describe_change(line_a, line_b),
                    source_a=_source_for(chunks_a, line_a),
                    source_b=_source_for(chunks_b, line_b),
                )
            )

    if not changes:
        diff = list(difflib.unified_diff(text_a.splitlines(), text_b.splitlines(), n=1))
        if diff:
            changes.append(
                ComparisonChange(
                    category="Text differences",
                    document_a=document_a.filename,
                    document_b=document_b.filename,
                    change="The documents contain textual differences, but no watched legal-risk category changed clearly.",
                )
            )

    return CompareResponse(
        summary=f"Compared {document_a.filename} with {document_b.filename}. Review the listed differences with a qualified professional before relying on them.",
        changes=changes[:12],
    )


def _best_line(text: str, term: str) -> str:
    for line in text.splitlines():
        cleaned = line.strip()
        if term in cleaned.lower():
            return cleaned[:500]
    return ""


def _describe_change(line_a: str, line_b: str) -> str:
    if line_a and line_b:
        return "Potentially important wording changed between the two documents."
    if line_a:
        return "The clause appears removed or not clearly present in Document B."
    return "The clause appears added or not clearly present in Document A."


def _source_for(chunks, line: str) -> SourceRef | None:
    if not line:
        return None
    for chunk in chunks:
        if line[:80] in chunk.text:
            return SourceRef(document_id=chunk.document_id, page=chunk.page_number, section=chunk.section, chunk_id=chunk.chunk_id, excerpt=line[:260])
    return None
