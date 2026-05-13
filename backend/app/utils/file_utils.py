from __future__ import annotations

import re
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.exceptions import InvalidFileError


def ensure_allowed_extension(filename: str, allowed_extensions: set[str]) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix not in allowed_extensions:
        allowed = ", ".join(sorted(allowed_extensions))
        raise InvalidFileError(f"Unsupported file type: {suffix or 'unknown'}. Allowed: {allowed}")
    return suffix


async def read_upload_bytes(upload_file: UploadFile, max_upload_size_mb: int) -> bytes:
    content = await upload_file.read()
    if not content:
        raise InvalidFileError("Uploaded file is empty.")
    max_size_bytes = max_upload_size_mb * 1024 * 1024
    if len(content) > max_size_bytes:
        raise InvalidFileError(
            f"Uploaded file exceeds max size of {max_upload_size_mb} MB."
        )
    return content


def sanitize_filename(filename: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9._-]", "_", filename.strip())
    return clean or "uploaded_file"


def save_upload_bytes(
    content: bytes,
    original_filename: str,
    destination_dir: Path,
) -> Path:
    destination_dir.mkdir(parents=True, exist_ok=True)
    safe_name = sanitize_filename(original_filename)
    target = destination_dir / f"{uuid4().hex}_{safe_name}"
    target.write_bytes(content)
    return target


def read_plain_text_file(file_path: Path) -> str:
    return file_path.read_text(encoding="utf-8", errors="ignore")

