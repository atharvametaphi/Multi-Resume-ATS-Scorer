from __future__ import annotations

from functools import lru_cache
from typing import Any

import spacy

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - handled gracefully in runtime fallback.
    SentenceTransformer = None  # type: ignore[assignment]

from app.core.config import get_settings


class NLPService:
    """Centralized lazy-loading for NLP dependencies."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self._spacy_nlp: Any | None = None
        self._sentence_model: SentenceTransformer | None = None

    def get_spacy_nlp(self):
        if self._spacy_nlp is None:
            try:
                self._spacy_nlp = spacy.load(self.settings.spacy_model)
            except OSError:
                # Fallback keeps app usable if model is not downloaded yet.
                self._spacy_nlp = spacy.blank("en")
        return self._spacy_nlp

    def get_sentence_model(self) -> SentenceTransformer | None:
        if self._sentence_model is None:
            if SentenceTransformer is None:
                return None
            try:
                self._sentence_model = SentenceTransformer(self.settings.sentence_model)
            except Exception:
                self._sentence_model = None
        return self._sentence_model


@lru_cache
def get_nlp_service() -> NLPService:
    return NLPService()
