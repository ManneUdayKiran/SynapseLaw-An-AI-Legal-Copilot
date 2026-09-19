# pyrefly: ignore [missing-import]
import pytest
from app.core.config import Settings
def _upload(client, headers, body=b"Tenant shall pay rent. Either party must provide 30 days notice before termination."):
    response = client.post(
        "/api/documents/upload",
        headers=headers,
        files={"file": ("contract.txt", body, "text/plain")},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_analysis_returns_structured_legal_sections(client, auth_headers):
    document_id = _upload(client, auth_headers)
    response = client.post(f"/api/documents/{document_id}/analyze", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["summary"]
    assert "risks" in data
    assert data["disclaimer"].startswith("LexiGuide")


def test_question_missing_evidence_is_cautious(client, auth_headers):
    document_id = _upload(client, auth_headers, b"This agreement discusses only rent due on the first day.")
    response = client.post(
        f"/api/documents/{document_id}/ask",
        headers=auth_headers,
        json={"question": "Can the tenant sublease the apartment?"},
    )
    assert response.status_code == 200
    assert "couldn't find enough information" in response.json()["answer"] or response.json()["confidence"] == "LOW"


def test_question_returns_evidence_for_termination(client, auth_headers):
    document_id = _upload(client, auth_headers)
    response = client.post(
        f"/api/documents/{document_id}/ask",
        headers=auth_headers,
        json={"question": "Can either party terminate immediately?"},
    )
    assert response.status_code == 200
    assert response.json()["evidence"]


def test_openai_compatible_provider_analyze_and_answer():
    from app.ai.provider import OpenAICompatibleProvider
    provider = OpenAICompatibleProvider()

    # Test analyze fallback when _chat returns None
    result = provider.analyze("doc1", [{"text": "Tenant shall pay rent on the 1st of the month.", "document_id": "doc1"}])
    assert result.summary

    # Test answer fallback when _chat returns None
    ans = provider.answer("What is due?", [{"text": "Tenant shall pay rent.", "document_id": "doc1"}])
    assert ans.answer


def test_config_production_secret_validation():

    with pytest.raises(ValueError, match="secret_key must be configured"):
        Settings(app_env="production", secret_key="development-only-change-me")
