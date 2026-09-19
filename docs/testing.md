# Testing

## Backend

Backend tests use pytest and FastAPI's TestClient. They are deterministic and do not require real LLM or embedding API keys.

Covered areas:

- Health endpoint.
- Register, login, invalid credentials, and current user.
- Protected endpoint authentication.
- TXT upload success.
- Unsupported, empty, and oversized upload rejection.
- Chunk metadata preservation.
- Vector retrieval for relevant clauses.
- Structured analysis response.
- Missing evidence behavior.
- Document comparison for changed termination terms.

Run:

```bash
cd backend
python -m pytest
```

## Frontend

Frontend tests use Vitest, jsdom, and Testing Library.

Covered areas:

- Login page labels and rendering.
- Registration page labels and rendering.
- Accessible upload control.
- Analysis finding rendering with interpretation and evidence separation.

Run:

```bash
cd frontend
npm test
```
