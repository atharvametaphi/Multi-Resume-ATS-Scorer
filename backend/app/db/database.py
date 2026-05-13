from __future__ import annotations

import sqlite3
from contextlib import contextmanager

from app.core.config import get_settings


CREATE_ANALYSES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    resume_filename TEXT NOT NULL,
    jd_source TEXT NOT NULL,
    ats_score REAL NOT NULL,
    skill_match_score REAL NOT NULL,
    keyword_match_score REAL NOT NULL,
    semantic_similarity_score REAL NOT NULL,
    experience_relevance_score REAL NOT NULL,
    matched_skills_preview TEXT NOT NULL,
    missing_skills_preview TEXT NOT NULL,
    report_path TEXT NOT NULL,
    analysis_json_path TEXT NOT NULL,
    created_at TEXT NOT NULL
);
"""


def _connect() -> sqlite3.Connection:
    settings = get_settings()
    db_path = settings.sqlite_db_absolute_path
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with _connect() as conn:
        conn.execute(CREATE_ANALYSES_TABLE_SQL)
        conn.commit()


@contextmanager
def get_db_connection():
    conn = _connect()
    try:
        yield conn
    finally:
        conn.close()

