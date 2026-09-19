from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.schemas.analysis import CompareRequest, CompareResponse
from app.services.comparison_service import compare_documents
from app.services.document_service import get_owned_document


router = APIRouter(prefix="/compare", tags=["comparison"])


@router.post("", response_model=CompareResponse)
def compare(payload: CompareRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    document_a = get_owned_document(db, current_user, payload.document_a_id)
    document_b = get_owned_document(db, current_user, payload.document_b_id)
    return compare_documents(document_a, document_b)
