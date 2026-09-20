from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.analysis import AnalysisResult, AskRequest, AskResponse
from app.schemas.document import ChecklistItemRead, ChecklistUpdate, DocumentRead
from app.services.analysis_service import (
    analyze_document,
    ask_document,
    invalidate_analysis_cache,
    prewarm_document_analysis,
)
from app.services.document_service import get_owned_document, list_documents, upload_document


router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentRead, status_code=201)
async def upload(
    file: UploadFile,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = await upload_document(db, current_user, file)
    background_tasks.add_task(prewarm_document_analysis, doc.id)
    return doc


@router.get("", response_model=list[DocumentRead])
def list_user_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return list_documents(db, current_user)


@router.get("/{document_id}", response_model=DocumentRead)
def get_document(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_owned_document(db, current_user, document_id)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_owned_document(db, current_user, document_id)
    invalidate_analysis_cache(document.id)
    db.delete(document)
    db.commit()


@router.post("/{document_id}/analyze", response_model=AnalysisResult)
def analyze(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return analyze_document(db, get_owned_document(db, current_user, document_id))


@router.post("/{document_id}/ask", response_model=AskResponse)
def ask(document_id: str, payload: AskRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ask_document(db, get_owned_document(db, current_user, document_id), payload.question)


@router.get("/{document_id}/checklist", response_model=list[ChecklistItemRead])
def checklist(document_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_owned_document(db, current_user, document_id)
    return [
        ChecklistItemRead(id=item.id, document_id=document.id, label=item.label, completed=bool(item.completed))
        for item in document.checklist_items
    ]


@router.patch("/{document_id}/checklist/{item_id}", response_model=ChecklistItemRead)
def update_checklist(document_id: str, item_id: str, payload: ChecklistUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document = get_owned_document(db, current_user, document_id)
    for item in document.checklist_items:
        if item.id == item_id:
            item.completed = 1 if payload.completed else 0
            db.commit()
            db.refresh(item)
            return ChecklistItemRead(id=item.id, document_id=document.id, label=item.label, completed=bool(item.completed))
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Checklist item not found")
