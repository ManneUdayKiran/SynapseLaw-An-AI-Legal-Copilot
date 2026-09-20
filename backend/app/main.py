from contextlib import asynccontextmanager
from time import monotonic

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import auth, compare, documents, health
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.db.database import init_db


configure_logging()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    get_settings.cache_clear()
    init_db()
    current_settings = get_settings()
    current_settings.storage_path.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(
    title="SynapseLaw API",
    description="AI Legal Document Copilot with evidence-grounded RAG workflows.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

_rate_bucket: dict[str, list[float]] = {}


@app.middleware("http")
async def security_headers_and_rate_limit(request: Request, call_next):
    path = request.url.path
    client_ip = request.client.host if request.client else "unknown"

    # Rate limiting on authentication and expensive AI endpoints
    is_auth_endpoint = path in {"/api/auth/login", "/api/auth/register"}
    is_expensive_ai_endpoint = (
        path == "/api/documents/upload"
        or path.endswith("/analyze")
        or path.endswith("/ask")
        or path == "/api/compare"
    )

    if is_auth_endpoint or is_expensive_ai_endpoint:
        limit = 20 if is_auth_endpoint else 60
        key = f"{client_ip}:{path if is_auth_endpoint else 'expensive_ai'}"
        now = monotonic()
        attempts = [t for t in _rate_bucket.get(key, []) if now - t < 60]
        if len(attempts) >= limit:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={"detail": "Too many attempts. Please wait and retry."},
            )
        attempts.append(now)
        _rate_bucket[key] = attempts

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=()"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; object-src 'none';"
    return response



@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    if settings.app_env == "development":
        raise exc
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(documents.router, prefix="/api")
app.include_router(compare.router, prefix="/api")
