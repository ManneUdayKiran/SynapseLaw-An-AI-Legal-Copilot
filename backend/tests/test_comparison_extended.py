def _upload(client, headers, filename, content):
    res = client.post(
        "/api/documents/upload",
        headers=headers,
        files={"file": (filename, content, "text/plain")},
    )
    assert res.status_code == 201
    return res.json()["id"]


def test_compare_identical_documents(client, auth_headers):
    content = b"Agreement terms: Termination requires 30 days notice. Payment is due monthly."
    id_a = _upload(client, auth_headers, "doc_a.txt", content)
    id_b = _upload(client, auth_headers, "doc_b.txt", content)

    res = client.post("/api/compare", headers=auth_headers, json={"document_a_id": id_a, "document_b_id": id_b})
    assert res.status_code == 200
    data = res.json()
    assert "Compared" in data["summary"]


def test_compare_text_diff_fallback(client, auth_headers):
    # Upload documents with general text differences but no specific watched keyword changes
    id_a = _upload(client, auth_headers, "alpha.txt", b"Section 1: General provisions for project alpha.")
    id_b = _upload(client, auth_headers, "beta.txt", b"Section 1: General provisions for project beta.")

    res = client.post("/api/compare", headers=auth_headers, json={"document_a_id": id_a, "document_b_id": id_b})
    assert res.status_code == 200
    data = res.json()
    assert len(data["changes"]) > 0


def test_compare_unowned_document_rejection(client, auth_headers):
    # User 1 uploads doc
    id_a = _upload(client, auth_headers, "user1_doc.txt", b"User 1 legal document.")

    # User 2 registers and uploads doc
    r2 = client.post(
        "/api/auth/register",
        json={"email": "comp_user2@example.com", "full_name": "User Two", "password": "password123"},
    )
    headers2 = {"Authorization": f"Bearer {r2.json()['access_token']}"}
    id_b = _upload(client, headers2, "user2_doc.txt", b"User 2 legal document.")

    # User 2 tries to compare User 1's doc with User 2's doc
    res = client.post("/api/compare", headers=headers2, json={"document_a_id": id_a, "document_b_id": id_b})
    assert res.status_code == 404
