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
