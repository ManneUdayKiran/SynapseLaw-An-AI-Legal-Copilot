from app.rag.chunker import Chunk, chunk_text
from app.rag.retriever import RetrievedChunk, vector_store


def index_document(document_id: str, text: str, sha256: str | None = None, force: bool = False) -> list[Chunk]:
    if not force and vector_store.has_document(document_id):
        return vector_store.get_document_chunks(document_id)
    chunks = chunk_text(document_id, text)
    vector_store.index(chunks, sha256=sha256, force=force)
    return chunks


def retrieve_context(
    document_id: str,
    question: str,
    top_k: int = 4,
    min_relevance: float = 0.05,
) -> list[RetrievedChunk]:
    return vector_store.search(document_id, question, top_k=top_k, min_relevance=min_relevance)
