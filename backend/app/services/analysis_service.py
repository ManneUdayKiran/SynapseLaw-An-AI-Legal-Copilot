import json

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.provider import get_ai_provider
from app.db.models import Analysis, ChecklistItem, Document, QuestionHistory
from app.rag.pipeline import index_document, retrieve_context
from app.schemas.analysis import AnalysisResult, AskResponse


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
    existing = db.scalar(select(Analysis).where(Analysis.document_id == document.id).order_by(Analysis.created_at.desc()))
    if existing:
        return AnalysisResult.model_validate_json(existing.result_json)
    result = get_ai_provider().analyze(document.id, _all_excerpts(document))
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
    index_document(document.id, document.extracted_text)
    retrieved = retrieve_context(document.id, question)
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
        excerpts = _all_excerpts(document)[:6]
    result = get_ai_provider().answer(question, excerpts)
    db.add(QuestionHistory(document_id=document.id, question=question, answer_json=result.model_dump_json()))
    db.commit()
    return result
