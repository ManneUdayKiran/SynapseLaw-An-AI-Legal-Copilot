from typing import Literal

from pydantic import BaseModel, Field


Severity = Literal["LOW", "MEDIUM", "HIGH"]


class SourceRef(BaseModel):
    document_id: str | None = None
    page: int | None = None
    section: str | None = None
    chunk_id: str | None = None
    excerpt: str | None = None


class Finding(BaseModel):
    title: str
    explanation: str
    severity: Severity | None = None
    source: SourceRef | None = None
    suggested_action: str | None = None


class PerformanceMetrics(BaseModel):
    document_processing_ms: float | None = None
    retrieval_ms: float | None = None
    llm_generation_ms: float | None = None
    total_response_ms: float | None = None
    retrieved_chunks_count: int | None = None
    context_size_chars: int | None = None
    cache_hit: bool | None = None


class AnalysisResult(BaseModel):
    summary: str
    key_clauses: list[Finding] = Field(default_factory=list)
    obligations: list[Finding] = Field(default_factory=list)
    risks: list[Finding] = Field(default_factory=list)
    important_dates: list[Finding] = Field(default_factory=list)
    action_items: list[Finding] = Field(default_factory=list)
    lawyer_questions: list[Finding] = Field(default_factory=list)
    disclaimer: str = "LexiGuide provides informational assistance and does not replace professional legal advice."
    metrics: PerformanceMetrics | None = None


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


class AskResponse(BaseModel):
    answer: str
    evidence: list[SourceRef] = Field(default_factory=list)
    confidence: Literal["LOW", "MEDIUM", "HIGH"] = "LOW"
    disclaimer: str = "LexiGuide provides informational assistance and does not replace professional legal advice."
    metrics: PerformanceMetrics | None = None


class CompareRequest(BaseModel):
    document_a_id: str
    document_b_id: str


class ComparisonChange(BaseModel):
    category: str
    document_a: str
    document_b: str
    change: str
    source_a: SourceRef | None = None
    source_b: SourceRef | None = None


class CompareResponse(BaseModel):
    summary: str
    changes: list[ComparisonChange] = Field(default_factory=list)
    disclaimer: str = "LexiGuide provides informational assistance and does not replace professional legal advice."
