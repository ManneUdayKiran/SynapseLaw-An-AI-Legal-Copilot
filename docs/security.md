# Security

LexiGuide implements production-style controls appropriate for a hackathon project.

## Authentication

- Registration and login are implemented with FastAPI routes.
- Passwords are hashed with Argon2 through Passlib.
- JWTs are signed with `SECRET_KEY` from the environment.
- Protected document endpoints require a bearer token.
- Password hashes are never returned by response schemas.

## Upload Safety

- Supported file extensions are limited to PDF, DOCX, and TXT.
- MIME types are validated, but not trusted alone.
- File signatures are checked for PDF and DOCX.
- Empty files and oversized files are rejected.
- Filenames are normalized with `Path(...).name`.
- Stored filenames use SHA-256 hashes, not user-controlled paths.
- Path traversal is blocked by resolving stored paths under the configured storage root.
- Uploaded files are not executed.

## API Safety

- SQLAlchemy ORM avoids string-built SQL queries.
- CORS origins come from `CORS_ORIGINS`.
- Sensitive auth endpoints include simple in-memory rate limiting.
- Security headers include `X-Content-Type-Options`, `X-Frame-Options`, and `Referrer-Policy`.
- Production mode returns safe generic errors for unexpected exceptions.
- Logging is configured without document body, token, password, or API key logging.

## Secrets

No API keys or JWT secrets are committed. Use `backend/.env.example` as a template and create a private `.env` locally.
