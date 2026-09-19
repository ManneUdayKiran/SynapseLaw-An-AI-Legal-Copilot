def upload_named(client, headers, name, body):
    response = client.post(
        "/api/documents/upload",
        headers=headers,
        files={"file": (name, body.encode(), "text/plain")},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_compare_documents_flags_changed_termination(client, auth_headers):
    a_id = upload_named(client, auth_headers, "lease-a.txt", "Termination requires 30 days written notice.")
    b_id = upload_named(client, auth_headers, "lease-b.txt", "Termination requires 60 days written notice.")
    response = client.post(
        "/api/compare",
        headers=auth_headers,
        json={"document_a_id": a_id, "document_b_id": b_id},
    )
    assert response.status_code == 200
    assert any(change["category"] == "Termination" for change in response.json()["changes"])
