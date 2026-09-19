from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_security_headers(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "no-referrer"


def test_password_hashing_and_verification():
    raw_password = "SuperSecretPassword123!"
    hashed = hash_password(raw_password)
    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_creation_and_decoding():
    subject = "user-id-12345"
    token = create_access_token(subject, expires_minutes=15)
    decoded = decode_access_token(token)
    assert decoded == subject


def test_jwt_invalid_token_returns_none():
    assert decode_access_token("invalid.jwt.token") is None
    assert decode_access_token("") is None


def test_rate_limiting_on_auth_endpoints(client):
    # Simulate repeated login attempts
    payload = {"email": "ratelimit@example.com", "password": "wrong-password"}
    responses = [client.post("/api/auth/login", json=payload) for _ in range(21)]
    assert responses[-1].status_code == 429
    assert "Too many attempts" in responses[-1].json()["detail"]
