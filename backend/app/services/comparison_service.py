import difflib
from time import perf_counter

from app.db.models import Document
from app.rag.chunker import chunk_text
from app.rag.retriever import vector_store
from app.schemas.analysis import CompareResponse, ComparisonChange, PerformanceMetrics, SourceRef

WATCH_TERMS = [
    "termination", "payment", "deadline", "penalty", "liability",
    "renewal", "confidential", "governing law", "jurisdiction", "indemnif", "dispute"
]

_comparison_cache: dict[tuple[str, str], CompareResponse] = {}


def compare_documents(document_a: Document, document_b: Document) -> CompareResponse:
    t0 = perf_counter()
    cache_key = (document_a.id, document_b.id)

    # 1. Comparison Cache Hit
    if cache_key in _comparison_cache:
        cached = _comparison_cache[cache_key]
        total_ms = round((perf_counter() - t0) * 1000, 2)
        cached.metrics = PerformanceMetrics(
            total_response_ms=total_ms,
            cache_hit=True,
        )
        return cached

    # 2. Identical Document Cryptographic Fast-Path (sub-millisecond)
    if document_a.sha256 == document_b.sha256:
        total_ms = round((perf_counter() - t0) * 1000, 2)
        res = CompareResponse(
            summary=f"Compared {document_a.filename} with {document_b.filename}. Documents are identical based on SHA-256 cryptographic verification.",
            changes=[],
            metrics=PerformanceMetrics(
                total_response_ms=total_ms,
                cache_hit=True,
                retrieved_chunks_count=0,
            ),
        )
        _comparison_cache[cache_key] = res
        return res

    # 3. Reuse pre-computed vector store chunks if available, avoiding redundant chunking
    chunks_a = vector_store.get_document_chunks(document_a.id) or chunk_text(document_a.id, document_a.extracted_text)
    chunks_b = vector_store.get_document_chunks(document_b.id) or chunk_text(document_b.id, document_b.extracted_text)

    text_a = "\n".join(chunk.text for chunk in chunks_a)
    text_b = "\n".join(chunk.text for chunk in chunks_b)
    changes: list[ComparisonChange] = []

    # 4. Deterministic Legal & Risk Term Diffing
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

    # 5. Semantic/Structural Fallback Diffing
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

    total_ms = round((perf_counter() - t0) * 1000, 2)
    response = CompareResponse(
        summary=f"Compared {document_a.filename} with {document_b.filename}. Review the listed differences with a qualified professional before relying on them.",
        changes=changes[:12],
        metrics=PerformanceMetrics(
            total_response_ms=total_ms,
            retrieved_chunks_count=len(chunks_a) + len(chunks_b),
            context_size_chars=len(text_a) + len(text_b),
            cache_hit=False,
        ),
    )
    _comparison_cache[cache_key] = response
    return response


def _best_line(text: str, term: str) -> str:
    for line in text.splitlines():
        cleaned = line.strip()
        if term in cleaned.lower():
            return cleaned[:500]
    return ""


def _describe_change(line_a: str, line_b: str) -> str:
    if line_a and line_b:
        return "Potentially important wording or requirement changed between the two documents."
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
