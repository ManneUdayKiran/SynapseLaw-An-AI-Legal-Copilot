from time import perf_counter
import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.provider import get_ai_provider
from app.db.models import Analysis, ChecklistItem, Document, QuestionHistory
from app.rag.pipeline import index_document, retrieve_context
from app.schemas.analysis import AnalysisResult, AskResponse, PerformanceMetrics


def _all_excerpts(document: Document) -> list[dict[str, object]]:
    chunks = index_document(document.id, document.extracted_text)
    return [
        {
            "document_id": chunk.document_id,
            "chunk_id": chunk.chunk_id,
            "page_number": chunk.page_number,
            "section": chunk.section,
            "text": chunk.text,
        }
        for chunk in chunks
    ]


def analyze_document(db: Session, document: Document) -> AnalysisResult:
    t0 = perf_counter()
    existing = db.scalar(select(Analysis).where(Analysis.document_id == document.id).order_by(Analysis.created_at.desc()))
    if existing:
        res = AnalysisResult.model_validate_json(existing.result_json)
        total_ms = round((perf_counter() - t0) * 1000, 2)
        res.metrics = PerformanceMetrics(
            document_processing_ms=0.0,
            total_response_ms=total_ms,
            cache_hit=True,
        )
        return res

    excerpts = _all_excerpts(document)
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
    return result


def ask_document(db: Session, document: Document, question: str) -> AskResponse:
    t0 = perf_counter()
    index_document(document.id, document.extracted_text)

    t_retrieval = perf_counter()
    retrieved = retrieve_context(document.id, question, top_k=4)
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
        excerpts = _all_excerpts(document)[:4]

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
        cache_hit=len(retrieved) > 0,
    )

    db.add(QuestionHistory(document_id=document.id, question=question, answer_json=result.model_dump_json()))
    db.commit()
    return result
