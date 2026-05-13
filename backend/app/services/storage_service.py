from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.core.config import get_settings


class StorageService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def ensure_storage_dirs(self) -> None:
        self.settings.upload_absolute_dir.mkdir(parents=True, exist_ok=True)
        self.settings.analysis_absolute_dir.mkdir(parents=True, exist_ok=True)
        self.settings.report_absolute_dir.mkdir(parents=True, exist_ok=True)

    def save_analysis_payload(self, analysis_id: str, payload: dict[str, Any]) -> Path:
        self.ensure_storage_dirs()
        target = self.settings.analysis_absolute_dir / f"{analysis_id}.json"
        target.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return target

    @staticmethod
    def load_json(path: Path) -> dict[str, Any]:
        return json.loads(path.read_text(encoding="utf-8"))

