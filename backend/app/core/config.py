from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


ROOT_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = ROOT_DIR / "backend"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(ROOT_DIR / ".env", BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_env: str = "development"
    app_name: str = "AI Resume Analyzer"
    api_v1_prefix: str = "/api/v1"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173"

    sqlite_db_path: str = "backend/app.db"
    max_upload_size_mb: int = 5
    spacy_model: str = "en_core_web_sm"
    sentence_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    upload_dir: str = "backend/storage/uploads"
    analysis_dir: str = "backend/storage/analyses"
    report_dir: str = "backend/storage/reports"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def to_absolute_path(self, relative_or_absolute_path: str) -> Path:
        path = Path(relative_or_absolute_path)
        return path if path.is_absolute() else ROOT_DIR / path

    @property
    def sqlite_db_absolute_path(self) -> Path:
        return self.to_absolute_path(self.sqlite_db_path)

    @property
    def upload_absolute_dir(self) -> Path:
        return self.to_absolute_path(self.upload_dir)

    @property
    def analysis_absolute_dir(self) -> Path:
        return self.to_absolute_path(self.analysis_dir)

    @property
    def report_absolute_dir(self) -> Path:
        return self.to_absolute_path(self.report_dir)


@lru_cache
def get_settings() -> Settings:
    return Settings()

