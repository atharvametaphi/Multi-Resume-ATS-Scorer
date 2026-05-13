from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.db.database import init_db
from app.main import app
from app.services.storage_service import StorageService


@pytest.fixture(scope="session", autouse=True)
def initialize_backend():
    init_db()
    StorageService().ensure_storage_dirs()
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_resume_text() -> str:
    return """Alex Johnson
Email: alex@example.com

Skills
Python, FastAPI, SQL, Docker, React

Experience
Software Engineer at Example Corp (2021-2025)
- Built scalable APIs and analytics pipelines.

Education
B.Tech in Computer Science - ABC University

Projects
Resume Analyzer using NLP
"""


@pytest.fixture
def sample_jd_text() -> str:
    return """We are hiring a Backend Engineer.
Required skills: Python, FastAPI, SQL, AWS, Docker.
Must have 3 years experience building REST APIs.
"""

