def test_register_login_and_me(client):
    payload = {"email": "user@example.com", "full_name": "User Example", "password": "very-secure-pass"}
    created = client.post("/api/auth/register", json=payload)
    assert created.status_code == 201
    assert "access_token" in created.json()
    assert "password_hash" not in created.text

    login = client.post("/api/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["email"] == payload["email"]


def test_invalid_credentials(client):
    response = client.post("/api/auth/login", json={"email": "missing@example.com", "password": "bad"})
    assert response.status_code == 401


def test_unauthenticated_endpoint_uses_guest_session(client):
    response = client.get("/api/documents")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
