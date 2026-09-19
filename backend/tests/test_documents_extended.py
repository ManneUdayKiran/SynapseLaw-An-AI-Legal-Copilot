def _upload(client, headers, content=b"Standard legal contract content for testing documents extended."):
    res = client.post(
        "/api/documents/upload",
        headers=headers,
        files={"file": ("contract.txt", content, "text/plain")},
    )
    assert res.status_code == 201
    return res.json()["id"]


def test_document_deletion_and_cascade(client, auth_headers):
    doc_id = _upload(client, auth_headers)

    # Analyze to create associated analysis and checklist items
    client.post(f"/api/documents/{doc_id}/analyze", headers=auth_headers)

    # Delete document
    del_res = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
    assert del_res.status_code == 240 or del_res.status_code == 204

    # Verify document is gone
    get_res = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
    assert get_res.status_code == 404


def test_unowned_document_access_returns_404(client, auth_headers):
    # Register second user
    r2 = client.post(
        "/api/auth/register",
        json={"email": "user2@example.com", "full_name": "User Two", "password": "password123"},
    )
    token2 = r2.json()["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # User 1 uploads document
    doc_id = _upload(client, auth_headers)

    # User 2 tries to get User 1's document
    get_res = client.get(f"/api/documents/{doc_id}", headers=headers2)
    assert get_res.status_code == 404

    # User 2 tries to delete User 1's document
    del_res = client.delete(f"/api/documents/{doc_id}", headers=headers2)
    assert del_res.status_code == 404


def test_checklist_retrieval_and_update(client, auth_headers):
    doc_id = _upload(client, auth_headers, b"Tenant shall pay rent on time. Tenant must keep the property clean.")

    # Trigger analysis to populate checklist
    client.post(f"/api/documents/{doc_id}/analyze", headers=auth_headers)

    # Get checklist
    checklist_res = client.get(f"/api/documents/{doc_id}/checklist", headers=auth_headers)
    assert checklist_res.status_code == 200
    items = checklist_res.json()
    assert len(items) > 0

    item_id = items[0]["id"]
    initial_completed = items[0]["completed"]

    # Toggle checklist item completion
    patch_res = client.patch(
        f"/api/documents/{doc_id}/checklist/{item_id}",
        headers=auth_headers,
        json={"completed": not initial_completed},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["completed"] == (not initial_completed)


def test_update_nonexistent_checklist_item_returns_404(client, auth_headers):
    doc_id = _upload(client, auth_headers)
    patch_res = client.patch(
        f"/api/documents/{doc_id}/checklist/invalid-item-id",
        headers=auth_headers,
        json={"completed": True},
    )
    assert patch_res.status_code == 404


def test_duplicate_upload_deduplication(client, auth_headers):
    content = b"Exact duplicate document content for sha256 hash deduplication testing."
    id1 = _upload(client, auth_headers, content)
    id2 = _upload(client, auth_headers, content)
    assert id1 == id2
