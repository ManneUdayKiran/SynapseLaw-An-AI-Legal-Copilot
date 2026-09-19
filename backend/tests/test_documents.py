def test_upload_txt_document(client, auth_headers, sample_contract_bytes):
    response = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("sample_contract.txt", sample_contract_bytes, "text/plain")},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["filename"] == "sample_contract.txt"
    assert data["chunk_count"] >= 1


def test_reject_unsupported_extension(client, auth_headers):
    response = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("malware.exe", b"not executable but invalid", "application/octet-stream")},
    )
    assert response.status_code == 400


def test_reject_empty_file(client, auth_headers):
    response = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("empty.txt", b"", "text/plain")},
    )
    assert response.status_code == 400


def test_reject_oversized_file(client, auth_headers):
    response = client.post(
        "/api/documents/upload",
        headers=auth_headers,
        files={"file": ("large.txt", b"a" * (6 * 1024 * 1024), "text/plain")},
    )
    assert response.status_code == 413
