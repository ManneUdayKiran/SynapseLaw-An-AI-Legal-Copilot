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

    def index(self, chunks: list[Chunk]) -> None:
        if not chunks:
            return
        document_id = chunks[0].document_id
        self._records[document_id] = [(chunk, self.embedding_provider.embed(chunk.text)) for chunk in chunks]

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
