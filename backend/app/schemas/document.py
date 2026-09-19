from datetime import datetime

from pydantic import BaseModel


class DocumentRead(BaseModel):
    id: str
    filename: str
    content_type: str
    size_bytes: int
    chunk_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ChecklistItemRead(BaseModel):
    id: str
    document_id: str
    label: str
    completed: bool


class ChecklistUpdate(BaseModel):
    completed: bool
