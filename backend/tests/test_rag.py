from app.rag.chunker import chunk_text
from app.rag.pipeline import index_document, retrieve_context


def test_chunking_preserves_metadata():
    chunks = chunk_text("doc1", "[Page 4]\nTermination\nEither party must provide 30 days notice.")
    assert chunks
    assert chunks[0].page_number == 4
    assert chunks[0].document_id == "doc1"


def test_retrieval_finds_relevant_clause():
    index_document("doc1", "Termination requires 30 days written notice.\n\nPayment is due monthly.")
    results = retrieve_context("doc1", "Can termination happen immediately?")
    assert results
    assert "Termination" in results[0].chunk.text
