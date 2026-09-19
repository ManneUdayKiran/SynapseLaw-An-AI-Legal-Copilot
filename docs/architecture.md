# LexiGuide Architecture

LexiGuide is a React + FastAPI application for document-grounded legal information assistance.

## Layers

- Frontend: React, React Router, Axios, and Material UI render authenticated legal document workflows.
- API: FastAPI exposes REST endpoints under `/api`.
- Database: SQLAlchemy stores users, document metadata, cached analysis, checklist items, and question history.
- Document service: validates uploads, extracts PDF/DOCX/TXT text, cleans content, and indexes chunks.
- RAG layer: chunks text with page/section metadata, embeds chunks with a local hashing provider, and retrieves top-k chunks.
- AI provider layer: exposes a provider interface with a deterministic local extractive provider and an OpenAI-compatible extension point.

## Flow

1. User uploads PDF, DOCX, or TXT.
2. Backend validates extension, MIME type, file size, emptiness, and document signature.
3. Text is extracted and cleaned.
4. Text is chunked with document ID, page number, section, and chunk ID metadata.
5. Chunks are embedded and indexed in a lightweight in-memory vector store.
6. Analysis and questions retrieve bounded evidence instead of sending the entire document repeatedly.
7. Responses separate AI interpretation from document evidence and include the legal disclaimer.

## Storage

Uploaded files are stored under `STORAGE_DIR` or the user's home `.lexiguide/storage` directory by default. The database stores metadata and extracted text, not raw file bytes. IDs are generated and internal paths are never exposed by the API.
