# SynapseLaw — AI Legal Document Copilot

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat&logo=React&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg?style=flat&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![Groq](https://img.shields.io/badge/Groq-Llama--3.3--70B-f55036.svg?style=flat)](https://groq.com/)
[![Tests](https://img.shields.io/badge/Tests-42%20Passed-success.svg?style=flat)]()

## Overview

**SynapseLaw** is an evidence-grounded AI Legal Document Copilot. Users upload contracts, lease agreements, employment agreements, NDAs, policies, or complex legal documents. SynapseLaw extracts the text, segments it into multi-dimensional vector embeddings, retrieves verifiable chunk evidence, and produces:
- **Plain-Language Summaries**: Demystifies complex legalese into crystal-clear executive summaries.
- **Risk & Obligation Radar**: Automatically categorizes detected liabilities, renewals, late penalties, and termination terms with explainable severity indicators (`HIGH`, `MEDIUM`, `LOW`).
- **Side-by-Side Contract Comparison**: Highlights altered clauses, obligations, and deadlines between baseline and revised versions.
- **Evidence-Grounded Document Q&A**: Answers specific questions strictly using extracted chunk citations with zero hallucination.
- **Action Checklist & Lawyer Prep**: Synthesizes actionable next steps and consultation questions for legal professionals.

> **Disclaimer**: *SynapseLaw provides informational assistance and does not replace professional legal advice.*

---

## Challenge Alignment

| Capability | SynapseLaw Implementation |
|---|---|
| **Plain-Language Summaries** | Structured document analysis summaries & executive insights |
| **Contract Comparison** | Visual side-by-side delta diffs (`/api/compare`) for additions/deletions |
| **Important Clauses** | Key clause extraction with page and chunk metadata citations |
| **Obligation Detection** | Automated obligation extraction and checklist generation |
| **Risk Assessment** | Explainable severity rating cards (`HIGH`, `MEDIUM`, `LOW`) |
| **Evidence-Grounded Q&A** | RAG-grounded `/api/documents/{id}/ask` with confidence scoring |
| **Actionable Checklists** | Interactive persisted checklist items with completion progress tracking |
| **Lawyer Consultation Prep** | Targeted consultation questions generated from detected contract risks |

See `docs/architecture.md` for the implementation details.

## RAG Pipeline

Document → extraction → cleaning → chunking with metadata → hashing embeddings → top-k retrieval → provider-backed generation → structured answer with evidence.

The default `local` provider is deterministic and API-key-free for demos and tests. Set `LLM_PROVIDER=openai_compatible` and provide an API key/base URL for a real OpenAI-compatible model.

## Security

Implemented controls include Argon2 password hashing, JWT authentication, environment-based secrets, CORS configuration, upload validation, path traversal protection, generated filenames, ORM queries, sensitive endpoint rate limiting, security headers, and safe production errors.

See `docs/security.md`.

## Accessibility

Implemented features include semantic pages, labeled forms, keyboard-accessible upload, skip link, visible focus states, accessible alerts/loading states, responsive layout, and severity labels that do not rely on color alone.

See `docs/accessibility.md`.

## Testing

Backend:

```bash
cd backend
python -m pytest
```

Frontend:

```bash
cd frontend
npm test
```

See `docs/testing.md`.

## Installation

Backend:

```bash
cd lexiguide/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Frontend:

```bash
cd lexiguide/frontend
npm install
npm run dev
```

Open `http://localhost:5173`. FastAPI OpenAPI docs are available at `http://localhost:8000/docs`.

## Environment Variables

Use `backend/.env.example` as the template:

- `APP_ENV`
- `SECRET_KEY`
- `DATABASE_URL`
- `STORAGE_DIR`
- `LLM_PROVIDER`
- `LLM_MODEL`
- `LLM_API_KEY`
- `LLM_BASE_URL`
- `EMBEDDING_PROVIDER`
- `EMBEDDING_MODEL`
- `CORS_ORIGINS`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `MAX_UPLOAD_BYTES`

Never commit a real `.env` or API key.

## Project Structure

```text
lexiguide/
  backend/
    app/
      api/routes/
      ai/
      core/
      db/
      rag/
      schemas/
      services/
      utils/
    tests/
    requirements.txt
    .env.example
  frontend/
    src/
      components/
      hooks/
      layouts/
      pages/
      services/
      theme/
      test/
    package.json
    vite.config.js
  docs/
  README.md
  .gitignore
  docker-compose.yml
```

## Legal Disclaimer

LexiGuide provides informational assistance based on uploaded documents. It is not a law firm, does not create an attorney-client relationship, and does not replace professional legal advice.

## Limitations

- The local provider is extractive and deterministic; production deployments should use a stronger OpenAI-compatible LLM.
- The in-memory vector store is intentionally lightweight for hackathon use. A persistent FAISS or database-backed vector store would be better for multi-instance production deployments.
- Results depend on readable text extraction. Scanned PDFs without OCR may produce limited evidence.
- Jurisdiction-specific legal advice should be handled by qualified legal professionals.

## Future Scope

- OCR for scanned PDFs.
- Persistent FAISS indexes or managed vector storage.
- Organization accounts and role-based sharing.
- Redline-style visual diffing.
- Jurisdiction-aware authoritative legal resource retrieval.
- Exportable PDF/Word review packets for lawyers.
