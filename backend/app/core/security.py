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


import html
import re
import unicodedata

HTML_TAG_RE = re.compile(r"<[^>]+>", re.DOTALL)
HTML_SCRIPT_STYLE_RE = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.DOTALL | re.IGNORECASE)
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)
CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200b\u200c\u200d\ufeff\u202a-\u202e\u2060-\u206f]")


def strict_sanitize_contract_text(text: str) -> str:
    """Perform strict input sanitization on contract text:
    1. HTML stripping: Removes scripts, styles, HTML tags, and comments.
    2. Control-character neutralization: Strips non-printable ASCII/Unicode control & zero-width characters.
    3. Regex normalization: Normalizes Unicode (NFKC), collapses whitespace, and standardizes punctuation.
    4. Blocks prompt delimiter escape injection vectors.
    """
    if not text:
        return ""

    # 1. HTML Stripping
    cleaned = HTML_SCRIPT_STYLE_RE.sub(" ", text)
    cleaned = HTML_COMMENT_RE.sub(" ", cleaned)
    cleaned = HTML_TAG_RE.sub(" ", cleaned)
    cleaned = html.unescape(cleaned)
    # Secondary pass in case unescaped entities revealed secondary HTML tags
    cleaned = HTML_TAG_RE.sub(" ", cleaned)

    # 2. Control-character neutralization
    cleaned = cleaned.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = CONTROL_CHARS_RE.sub(" ", cleaned)

    # 3. Regex & Unicode normalization
    cleaned = unicodedata.normalize("NFKC", cleaned)
    # Normalize typographer quotes and dashes
    cleaned = cleaned.replace("\u2018", "'").replace("\u2019", "'")
    cleaned = cleaned.replace("\u201c", '"').replace("\u201d", '"')
    cleaned = cleaned.replace("\u2013", "-").replace("\u2014", "-")

    # Neutralize injection delimiters
    cleaned = cleaned.replace("<untrusted_document_evidence>", "[untrusted_document_evidence]")
    cleaned = cleaned.replace("</untrusted_document_evidence>", "[/untrusted_document_evidence]")

    # Normalize excessive spaces and blank lines
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def sanitize_untrusted_text(text: str) -> str:
    """Sanitize untrusted text by neutralizing injection delimiters, HTML, and control sequences."""
    return strict_sanitize_contract_text(text)

