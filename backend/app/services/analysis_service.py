from time import perf_counter
import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.provider import get_ai_provider
from app.db.models import Analysis, ChecklistItem, Document, QuestionHistory
from app.rag.pipeline import index_document, retrieve_context
from app.schemas.analysis import AnalysisResult, AskResponse, PerformanceMetrics


ANALYSIS_WATCH_TERMS = {
    "shall", "must", "terminate", "payment", "liability", "indemnify",
    "penalty", "renewal", "confidential", "governing law", "dispute", "notice", "deadline"
}


def _select_analysis_excerpts(document: Document, max_chunks: int = 16) -> list[dict[str, object]]:
    """Select a bounded, deduplicated, and legally representative set of chunks for analysis.
    Prevents token bloat on massive contracts while retaining all critical legal clauses.
    """
    chunks = index_document(document.id, document.extracted_text, sha256=document.sha256)
    if len(chunks) <= max_chunks:
        selected = chunks
    else:
        # Score and prioritize chunks by key legal terminology density and position
        scored_chunks: list[tuple[int, int, object]] = []
        for idx, chunk in enumerate(chunks):
            lower = chunk.text.lower()
            term_score = sum(1 for term in ANALYSIS_WATCH_TERMS if term in lower)
            # Prioritize first and last chunks for preamble and signature/remedy clauses
            if idx == 0 or idx == len(chunks) - 1:
                term_score += 2
            scored_chunks.append((term_score, idx, chunk))

        # Sort by score descending, then take top candidates while maintaining document sequence
        scored_chunks.sort(key=lambda x: (x[0], -x[1]), reverse=True)
        top_candidates = sorted(scored_chunks[:max_chunks], key=lambda x: x[1])
        selected = [item[2] for item in top_candidates]

    # Deduplicate repetitive boilerplate chunks
    seen_texts: set[str] = set()
    excerpts: list[dict[str, object]] = []
    for chunk in selected:
        norm = " ".join(chunk.text.split())[:120].lower()
        if norm not in seen_texts:
            seen_texts.add(norm)
            excerpts.append(
                {
                    "document_id": chunk.document_id,
                    "chunk_id": chunk.chunk_id,
                    "page_number": chunk.page_number,
                    "section": chunk.section,
                    "text": chunk.text,
                }
            )
    return excerpts


_analysis_cache: dict[str, AnalysisResult] = {}


def invalidate_analysis_cache(document_id: str) -> None:
    _analysis_cache.pop(document_id, None)


def _all_excerpts(document: Document) -> list[dict[str, object]]:
    return _select_analysis_excerpts(document, max_chunks=16)


def analyze_document(db: Session, document: Document) -> AnalysisResult:
    t0 = perf_counter()

    # Fast-Path L1: In-memory memory-object cache (< 0.05ms)
    if document.id in _analysis_cache:
        res = _analysis_cache[document.id].model_copy(deep=True)
        res.metrics = PerformanceMetrics(
            document_processing_ms=0.0,
            total_response_ms=round((perf_counter() - t0) * 1000, 2),
            cache_hit=True,
        )
        return res

    # Fast-Path L2: Database stored result
    existing = db.scalar(select(Analysis).where(Analysis.document_id == document.id).order_by(Analysis.created_at.desc()))
    if existing:
        res = AnalysisResult.model_validate_json(existing.result_json)
        _analysis_cache[document.id] = res
        total_ms = round((perf_counter() - t0) * 1000, 2)
        res.metrics = PerformanceMetrics(
            document_processing_ms=0.0,
            total_response_ms=total_ms,
            cache_hit=True,
        )
        return res

    excerpts = _select_analysis_excerpts(document, max_chunks=16)
    result = get_ai_provider().analyze(document.id, excerpts)
    proc_ms = round((perf_counter() - t0) * 1000, 2)
    context_chars = sum(len(str(e.get("text", ""))) for e in excerpts)
    result.metrics = PerformanceMetrics(
        document_processing_ms=proc_ms,
        total_response_ms=proc_ms,
        retrieved_chunks_count=len(excerpts),
        context_size_chars=context_chars,
        cache_hit=False,
    )

    analysis = Analysis(document_id=document.id, result_json=result.model_dump_json())
    db.add(analysis)
    for item in result.action_items:
        db.add(
            ChecklistItem(
                document_id=document.id,
                label=item.title,
                source_json=json.dumps(item.source.model_dump() if item.source else {}),
            )
        )
    db.commit()
    _analysis_cache[document.id] = result
    return result


def prewarm_document_analysis(document_id: str) -> None:
    from app.db.database import SessionLocal
    with SessionLocal() as db:
        doc = db.get(Document, document_id)
        if doc:
            try:
                analyze_document(db, doc)
            except Exception:
                pass


def ask_document(db: Session, document: Document, question: str) -> AskResponse:
    t0 = perf_counter()
    norm_q = " ".join(question.strip().lower().split())

    # Question-Level Caching: Check if identical query was already answered for this document
    past_queries = db.scalars(
        select(QuestionHistory)
        .where(QuestionHistory.document_id == document.id)
        .order_by(QuestionHistory.created_at.desc())
    ).all()
    for past in past_queries:
        if " ".join(past.question.strip().lower().split()) == norm_q:
            cached_res = AskResponse.model_validate_json(past.answer_json)
            total_ms = round((perf_counter() - t0) * 1000, 2)
            cached_res.metrics = PerformanceMetrics(
                retrieval_ms=0.0,
                llm_generation_ms=0.0,
                total_response_ms=total_ms,
                retrieved_chunks_count=len(cached_res.evidence),
                context_size_chars=sum(len(e.excerpt or "") for e in cached_res.evidence),
                cache_hit=True,
            )
            return cached_res

    index_document(document.id, document.extracted_text, sha256=document.sha256)

    t_retrieval = perf_counter()
    retrieved = retrieve_context(document.id, question, top_k=4, min_relevance=0.05)
    retrieval_ms = round((perf_counter() - t_retrieval) * 1000, 2)

    excerpts = [
        {
            "document_id": item.chunk.document_id,
            "chunk_id": item.chunk.chunk_id,
            "page_number": item.chunk.page_number,
            "section": item.chunk.section,
            "text": item.chunk.text,
            "score": item.score,
        }
        for item in retrieved
    ]
    if not excerpts:
        excerpts = _select_analysis_excerpts(document, max_chunks=4)

    context_chars = sum(len(str(e.get("text", ""))) for e in excerpts)

    t_llm = perf_counter()
    result = get_ai_provider().answer(question, excerpts)
    llm_ms = round((perf_counter() - t_llm) * 1000, 2)
    total_ms = round((perf_counter() - t0) * 1000, 2)

    result.metrics = PerformanceMetrics(
        retrieval_ms=retrieval_ms,
        llm_generation_ms=llm_ms,
        total_response_ms=total_ms,
        retrieved_chunks_count=len(excerpts),
        context_size_chars=context_chars,
        cache_hit=False,
    )

    db.add(QuestionHistory(document_id=document.id, question=question, answer_json=result.model_dump_json()))
    db.commit()
    return result
