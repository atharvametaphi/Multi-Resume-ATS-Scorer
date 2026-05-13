from __future__ import annotations

import pytest

from app.core.exceptions import InvalidFileError
from app.utils.file_utils import ensure_allowed_extension


def test_ensure_allowed_extension_accepts_pdf():
    suffix = ensure_allowed_extension("resume.pdf", {".pdf", ".docx"})
    assert suffix == ".pdf"


def test_ensure_allowed_extension_rejects_txt():
    with pytest.raises(InvalidFileError):
        ensure_allowed_extension("resume.txt", {".pdf", ".docx"})

