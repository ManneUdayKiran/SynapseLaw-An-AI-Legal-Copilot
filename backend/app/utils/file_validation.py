import hashlib
import zipfile
from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException, UploadFile, status


ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/octet-stream",
}


@dataclass(frozen=True)
class ValidatedUpload:
    extension: str
    sha256: str
    size_bytes: int


DANGEROUS_EXTENSIONS = {".exe", ".sh", ".bat", ".cmd", ".py", ".js", ".vbs", ".ps1", ".php", ".bin"}


async def validate_upload(file: UploadFile, max_bytes: int) -> tuple[ValidatedUpload, bytes]:
    raw_name = (file.filename or "").replace("\x00", "").strip()
    safe_name = Path(raw_name).name
    if not safe_name or safe_name.startswith("."):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or malicious filename")

    suffixes = [s.lower() for s in Path(safe_name).suffixes]
    if any(s in DANGEROUS_EXTENSIONS for s in suffixes):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Executable and script file extensions are strictly prohibited")

    extension = Path(safe_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported MIME type")
    data = await file.read(max_bytes + 1)
    if len(data) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    if len(data) > max_bytes:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File is too large")
    _validate_signature(extension, data)
    return ValidatedUpload(extension, hashlib.sha256(data).hexdigest(), len(data)), data


def _validate_signature(extension: str, data: bytes) -> None:
    if extension == ".pdf" and not data.startswith(b"%PDF"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The PDF file appears corrupted")
    if extension == ".docx":
        try:
            with zipfile.ZipFile(__import__("io").BytesIO(data)) as archive:
                if "[Content_Types].xml" not in archive.namelist():
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The DOCX file appears corrupted")
        except zipfile.BadZipFile as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The DOCX file appears corrupted") from exc
    if extension == ".txt":
        try:
            data.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="TXT files must be UTF-8 encoded") from exc
