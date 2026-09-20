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
        self._sha_to_vectors: dict[str, list[list[float]]] = {}

    def has_document(self, document_id: str) -> bool:
        return document_id in self._records and len(self._records[document_id]) > 0

    def get_document_chunks(self, document_id: str) -> list[Chunk]:
        return [chunk for chunk, _ in self._records.get(document_id, [])]

    def index(self, chunks: list[Chunk], sha256: str | None = None, force: bool = False) -> None:
        if not chunks:
            return
        document_id = chunks[0].document_id
        if not force and self.has_document(document_id):
            return

        # Check if vectors for this exact content hash were already computed
        if sha256 and sha256 in self._sha_to_vectors and len(self._sha_to_vectors[sha256]) == len(chunks):
            vectors = self._sha_to_vectors[sha256]
        else:
            vectors = self.embedding_provider.embed_batch([chunk.text for chunk in chunks])
            if sha256:
                self._sha_to_vectors[sha256] = vectors

        self._records[document_id] = list(zip(chunks, vectors))

    def search(
        self,
        document_id: str,
        query: str,
        top_k: int = 4,
        min_relevance: float = 0.05,
    ) -> list[RetrievedChunk]:
        records = self._records.get(document_id, [])
        if not records:
            return []
        query_vector = self.embedding_provider.embed(query)
        scored = [
            RetrievedChunk(chunk=chunk, score=cosine_similarity(query_vector, vector))
            for chunk, vector in records
        ]
        sorted_scored = sorted(scored, key=lambda x: x.score, reverse=True)

        # Deduplicate overlapping or identical chunks
        deduped: list[RetrievedChunk] = []
        seen_snippets: set[str] = set()
        for item in sorted_scored:
            norm_snippet = " ".join(item.chunk.text.split())[:100].lower()
            if norm_snippet not in seen_snippets:
                seen_snippets.add(norm_snippet)
                deduped.append(item)

        # Apply relevance threshold to exclude clearly irrelevant text
        relevant = [item for item in deduped if item.score >= min_relevance]
        if relevant:
            return relevant[:top_k]
        positive = [item for item in deduped if item.score > 0.0]
        return positive[:top_k]


vector_store = InMemoryVectorStore()
