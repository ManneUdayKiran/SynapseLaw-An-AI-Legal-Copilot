from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings


ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: str, expires_minutes: int | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, get_settings().secret_key, algorithms=[ALGORITHM])
        subject = payload.get("sub")
        return str(subject) if subject else None
    except JWTError:
        return None


PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions",
    r"disregard\s+(?:all\s+)?(?:previous|prior|system)\s+instructions",
    r"reveal\s+(?:the\s+)?(?:system\s+prompt|secret|api\s*key|password)",
    r"output\s+(?:the\s+)?(?:system\s+prompt|environment\s+variables)",
    r"you\s+are\s+now\s+(?:in\s+developer\s+mode|an\s+unrestricted|dan)",
    r"override\s+(?:system\s+)?instructions",
    r"bypass\s+(?:all\s+)?security\s+guardrails",
]


def detect_prompt_injection(text: str) -> bool:
    """Detect common adversarial prompt injection patterns designed to hijack LLM instructions."""
    import re
    lowered = text.lower()
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, lowered):
            return True
    return False


def sanitize_untrusted_text(text: str) -> str:
    """Sanitize untrusted text by neutralizing injection delimiters and control sequences."""
    text = text.replace("\x00", "")
    text = text.replace("<untrusted_document_evidence>", "&lt;untrusted_document_evidence&gt;")
    text = text.replace("</untrusted_document_evidence>", "&lt;/untrusted_document_evidence&gt;")
    return text.strip()

