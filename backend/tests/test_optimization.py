import math
from app.rag.chunker import chunk_text
from app.rag.embeddings import HashingEmbeddingProvider, cosine_similarity
from app.services.document_service import clean_text


def test_hashing_embedding_provider_properties():
    provider = HashingEmbeddingProvider(dimensions=256)
    vec1 = provider.embed("The tenant agrees to pay rent on the first day of each month.")
    assert len(vec1) == 256
    # Check unit vector normalization
    norm = math.sqrt(sum(v * v for v in vec1))
    assert abs(norm - 1.0) < 1e-5

    # Check embedding determinism
    vec2 = provider.embed("The tenant agrees to pay rent on the first day of each month.")
    assert vec1 == vec2


def test_cosine_similarity_edge_cases():
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]
    v_zero = [0.0, 0.0, 0.0]

    assert abs(cosine_similarity(v1, v2) - 1.0) < 1e-5
    assert abs(cosine_similarity(v1, v3) - 0.0) < 1e-5
    assert cosine_similarity(v1, v_zero) == 0.0


def test_clean_text_utility():
    raw_text = "Hello\x00World!\t  This  has   extra    spaces.\n\n\n\nNew paragraph."
    cleaned = clean_text(raw_text)
    assert "\x00" not in cleaned
    assert "  " not in cleaned
    assert "\n\n\n" not in cleaned
    assert "Hello World!" in cleaned
    assert "New paragraph." in cleaned


def test_chunking_with_sections_and_pages():
    text = (
        "[Page 1]\n"
        "SECTION 1: DEFINITIONS\n"
        "The following words shall have specific meanings in this agreement.\n\n"
        "[Page 2]\n"
        "SECTION 2: TERMINATION\n"
        "Either party may terminate this agreement with 30 days notice."
    )
    chunks = chunk_text("doc123", text, chunk_size=150, overlap=30)
    assert len(chunks) >= 2
    assert chunks[0].document_id == "doc123"
    assert chunks[0].page_number is not None


def test_batch_embedding_consistency():
    provider = HashingEmbeddingProvider(dimensions=256)
    texts = [
        "First clause of the non-disclosure agreement.",
        "Second clause specifying liquidated damages of $10,000.",
    ]
    batch_vecs = provider.embed_batch(texts)
    assert len(batch_vecs) == 2
    for text, vec in zip(texts, batch_vecs):
        assert vec == provider.embed(text)


def test_vector_store_avoids_redundant_reindexing():
    from app.rag.retriever import InMemoryVectorStore
    store = InMemoryVectorStore()
    doc_id = "dedup-test-doc"
    chunks = chunk_text(doc_id, "Clause 1: Confidential Information means all proprietary data.")
    store.index(chunks)
    assert store.has_document(doc_id) is True

    # Mutate internally to verify subsequent index call does not overwrite without force
    store._records[doc_id] = [("mocked_record", [0.0] * 256)]
    store.index(chunks, force=False)
    assert store._records[doc_id] == [("mocked_record", [0.0] * 256)]

    # With force=True, it should re-index
    store.index(chunks, force=True)
    assert store._records[doc_id] != [("mocked_record", [0.0] * 256)]


def test_performance_telemetry_in_ask_endpoint(client, auth_headers):
    res = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("telemetry_test.txt", b"Rent is $2500 due on the first of each month.", "text/plain")},
    )
    doc_id = res.json()["id"]

    ask_res = client.post(
        f"/api/documents/{doc_id}/ask",
        headers=auth_headers,
        json={"question": "What is the monthly rent amount?"},
    )
    assert ask_res.status_code == 200
    data = ask_res.json()
    assert "metrics" in data
    metrics = data["metrics"]
    assert metrics is not None
    assert "retrieval_ms" in metrics
    assert "total_response_ms" in metrics
    assert isinstance(metrics["total_response_ms"], (int, float))
    assert metrics["total_response_ms"] >= 0.0


def test_repeated_question_cache_hit(client, auth_headers):
    """Verify identical questions on the same document return cached results instantly."""
    res = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("cache_q_test.txt", b"Tenant shall give 30 days notice to terminate.", "text/plain")},
    )
    doc_id = res.json()["id"]

    # First ask: executes retrieval and LLM
    ask1 = client.post(
        f"/api/documents/{doc_id}/ask",
        headers=auth_headers,
        json={"question": "How much notice is required to terminate?"},
    )
    assert ask1.status_code == 200
    assert ask1.json()["metrics"]["cache_hit"] is False

    # Second ask: identical question hits QuestionHistory cache with cache_hit=True
    ask2 = client.post(
        f"/api/documents/{doc_id}/ask",
        headers=auth_headers,
        json={"question": "How much notice is required to terminate?"},
    )
    assert ask2.status_code == 200
    data2 = ask2.json()
    assert data2["metrics"]["cache_hit"] is True
    assert data2["metrics"]["retrieval_ms"] == 0.0
    assert data2["metrics"]["llm_generation_ms"] == 0.0
    assert data2["answer"] == ask1.json()["answer"]


def test_identical_document_comparison_fast_path(client, auth_headers):
    """Verify comparing documents with matching SHA-256 executes sub-millisecond fast-path with 0 diffs."""
    content = b"Standard agreement content for fast path comparison test."
    res1 = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("contract_v1.txt", content, "text/plain")},
    )
    doc_id_1 = res1.json()["id"]

    res_cmp = client.post(
        "/api/compare",
        headers=auth_headers,
        json={"document_a_id": doc_id_1, "document_b_id": doc_id_1},
    )
    assert res_cmp.status_code == 200
    data = res_cmp.json()
    assert data["metrics"] is not None
    assert data["metrics"]["cache_hit"] is True
    assert len(data["changes"]) == 0
    assert "identical based on SHA-256" in data["summary"]
    assert "Compared" in data["summary"]


def test_list_documents_defers_extracted_text(client, auth_headers):
    """Verify list_documents endpoint does not return full extracted text payload."""
    client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("defer_test.txt", b"Document content for deferred loading.", "text/plain")},
    )
    res = client.get("/api/documents", headers=auth_headers)
    assert res.status_code == 200
    docs = res.json()
    assert len(docs) > 0
    assert "extracted_text" not in docs[0]
    assert "filename" in docs[0]


def test_retrieval_relevance_threshold_and_deduplication():
    """Verify vector search rejects irrelevant queries and deduplicates repeated clauses."""
    from app.rag.chunker import Chunk
    from app.rag.retriever import InMemoryVectorStore

    store = InMemoryVectorStore()
    doc_id = "test_relevance_doc"

    # Index chunks with repetition
    chunks = [
        Chunk(document_id=doc_id, chunk_id="c1", page_number=1, section="TERM", text="The tenant shall pay $2000 rent on the first day."),
        Chunk(document_id=doc_id, chunk_id="c2", page_number=1, section="TERM", text="The tenant shall pay $2000 rent on the first day."), # duplicate
        Chunk(document_id=doc_id, chunk_id="c3", page_number=2, section="PET", text="No dogs or cats are allowed without written permission."),
    ]
    store.index(chunks)

    # Search relevant query
    results = store.search(doc_id, "tenant rent payment", top_k=4)
    assert len(results) >= 1
    # Deduplication ensures identical chunk text is not duplicated in results
    assert len([r for r in results if "$2000 rent" in r.chunk.text]) == 1

    # Search query with relevance threshold (completely irrelevant query returns 0 chunks)
    results_empty = store.search(doc_id, "space shuttle rocket propulsion orbit", top_k=4, min_relevance=0.25)
    assert len(results_empty) == 0


def test_sha256_embedding_reuse():
    """Verify vector store reuses pre-computed embeddings for matching SHA-256 hashes."""
    from app.rag.chunker import Chunk
    from app.rag.retriever import InMemoryVectorStore

    store = InMemoryVectorStore()
    chunks1 = [Chunk(document_id="doc1", chunk_id="c1", page_number=1, section=None, text="Confidentiality shall last 5 years.")]
    chunks2 = [Chunk(document_id="doc2", chunk_id="c2", page_number=1, section=None, text="Confidentiality shall last 5 years.")]

    sample_sha = "aabbccddeeff00112233445566778899"
    store.index(chunks1, sha256=sample_sha)
    assert sample_sha in store._sha_to_vectors

    # Second document with same SHA-256 reuses vectors without calling embed_batch again
    initial_vectors = store._sha_to_vectors[sample_sha]
    store.index(chunks2, sha256=sample_sha)
    assert store._records["doc2"][0][1] == initial_vectors[0]


def test_document_inconsistency_detection():
    """Verify legal analysis detects internal contradictions (e.g. conflicting notice periods)."""
    from app.ai.provider import LocalExtractiveProvider

    contradictory_text = (
        "Section 2: Tenant may terminate this lease by giving 30 days notice in writing.\n"
        "Section 9: Either party may terminate the agreement upon 60 days notice.\n"
        "Section 14: Remedies provided herein are the sole and exclusive remedy, and remedies are cumulative."
    )
    provider = LocalExtractiveProvider()
    result = provider.analyze("doc_conflict", [{"text": contradictory_text}])

    assert len(result.inconsistencies) >= 1
    inconsistency_titles = [i.title.lower() for i in result.inconsistencies]
    assert any("conflicting notice periods" in t for t in inconsistency_titles)


