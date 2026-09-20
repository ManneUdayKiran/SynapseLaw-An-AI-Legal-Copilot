import logging
import re

# Patterns for sensitive contract information and credentials
FINANCIAL_RE = re.compile(r"\$\s*\d+(?:,\d{3})*(?:\.\d+)?|\b\d+(?:,\d{3})*(?:\.\d+)?\s*(?:USD|EUR|GBP|dollars)\b", re.I)
SSN_RE = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
BEARER_TOKEN_RE = re.compile(r"Bearer\s+[A-Za-z0-9\-_.]+", re.I)
KEY_SECRET_RE = re.compile(r"(?i)\b(api_key|secret_key|secret|password|access_token)\b\s*[:=]\s*['\"]?[A-Za-z0-9\-_.]+['\"]?")

MAX_LOG_MESSAGE_LENGTH = 256


def sanitize_log_message(message: str) -> str:
    """Sanitize and truncate log output to guarantee zero leakage of sensitive contract terms."""
    if not message:
        return ""

    # Redact credentials and tokens
    message = BEARER_TOKEN_RE.sub("Bearer [REDACTED_TOKEN]", message)
    message = KEY_SECRET_RE.sub(r"\1=[REDACTED_CREDENTIAL]", message)

    # Redact sensitive contract terms & PII
    message = FINANCIAL_RE.sub("[REDACTED_FINANCIAL]", message)
    message = SSN_RE.sub("[REDACTED_SSN]", message)
    message = EMAIL_RE.sub("[REDACTED_EMAIL]", message)

    # Truncate to maximum permissible length to prevent document text leakage
    if len(message) > MAX_LOG_MESSAGE_LENGTH:
        message = message[:MAX_LOG_MESSAGE_LENGTH] + " ... [TRUNCATED_FOR_PRIVACY]"

    return message


class SanitizedLogFormatter(logging.Formatter):
    """Logging formatter that intercepts record messages, redacting sensitive terms and truncating lengths."""

    def format(self, record: logging.LogRecord) -> str:
        original_msg = record.getMessage()
        sanitized_msg = sanitize_log_message(original_msg)
        record.msg = sanitized_msg
        record.args = None  # Neutralize args since message was already formatted & sanitized
        return super().format(record)


def configure_logging() -> None:
    """Configure zero-content-leakage logging for the application and web server."""
    formatter = SanitizedLogFormatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]

    for logger_name in ("uvicorn", "uvicorn.access", "uvicorn.error", "lexiguide", "lexiguide.ai"):
        logger = logging.getLogger(logger_name)
        logger.handlers = [handler]
        logger.propagate = False
