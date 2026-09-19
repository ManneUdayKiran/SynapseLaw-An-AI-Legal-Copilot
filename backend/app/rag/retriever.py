from dataclasses import dataclass

from app.rag.chunker import Chunk
from app.rag.embeddings import HashingEmbeddingProvider, cosine_similarity


@dataclass(frozen=True)
class RetrievedChunk:
    chunk: Chunk
    score: float


class InMemoryVectorStore:
    def __init__(self) -> None:
        self.embedding_provider = HashingEmbeddingProvider()
        self._records: dict[str, list[tuple[Chunk, list[float]]]] = {}

    def has_document(self, document_id: str) -> bool:
        return document_id in self._records and len(self._records[document_id]) > 0

    def get_document_chunks(self, document_id: str) -> list[Chunk]:
        return [chunk for chunk, _ in self._records.get(document_id, [])]

    def index(self, chunks: list[Chunk], force: bool = False) -> None:
        if not chunks:
            return
        document_id = chunks[0].document_id
        if not force and self.has_document(document_id):
            return
        vectors = self.embedding_provider.embed_batch([chunk.text for chunk in chunks])
        self._records[document_id] = list(zip(chunks, vectors))

    def search(self, document_id: str, query: str, top_k: int = 4) -> list[RetrievedChunk]:
        records = self._records.get(document_id, [])
        if not records:
            return []
        query_vector = self.embedding_provider.embed(query)
        scored = [
            RetrievedChunk(chunk=chunk, score=cosine_similarity(query_vector, vector))
            for chunk, vector in records
        ]
        sorted_scored = sorted(scored, key=lambda x: x.score, reverse=True)
        positive = [item for item in sorted_scored[:top_k] if item.score > 0.0]
        return positive if positive else sorted_scored[:top_k]


vector_store = InMemoryVectorStore()
