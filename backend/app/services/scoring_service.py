from __future__ import annotations

from typing import Any

import numpy as np

from app.schemas.internal import ParsedResumeData, ScoreResult
from app.services.nlp_service import NLPService, get_nlp_service
from app.utils.text_utils import to_unique_preserving_order


class ScoringService:
    SKILL_WEIGHT = 0.40
    KEYWORD_WEIGHT = 0.20
    SEMANTIC_WEIGHT = 0.25
    EXPERIENCE_WEIGHT = 0.15

    def __init__(self, nlp_service: NLPService | None = None) -> None:
        self._nlp_service = nlp_service or get_nlp_service()

    def score(
        self,
        parsed_resume: ParsedResumeData,
        jd_data: dict[str, Any],
        resume_text: str,
        jd_text: str,
    ) -> ScoreResult:
        required_skills = [skill.lower() for skill in jd_data.get("required_skills", [])]
        resume_skills = [skill.lower() for skill in parsed_resume.skills]

        matched_skills = to_unique_preserving_order(
            [skill for skill in parsed_resume.skills if skill.lower() in set(required_skills)]
        )
        missing_skills = to_unique_preserving_order(
            [skill for skill in jd_data.get("required_skills", []) if skill.lower() not in set(resume_skills)]
        )

        if required_skills:
            skill_match_score = (len(matched_skills) / len(set(required_skills))) * 100
        else:
            skill_match_score = 50.0

        keywords = [keyword.lower() for keyword in jd_data.get("keywords", [])]
        keyword_hits = parsed_resume.keyword_hits
        keyword_match_score = (len(keyword_hits) / len(keywords) * 100) if keywords else 50.0

        semantic_similarity_score = self._semantic_similarity(resume_text, jd_text)
        experience_relevance_score = self._experience_score(
            parsed_resume.total_experience_years,
            float(jd_data.get("required_experience_years", 0.0)),
        )

        final_score = (
            skill_match_score * self.SKILL_WEIGHT
            + keyword_match_score * self.KEYWORD_WEIGHT
            + semantic_similarity_score * self.SEMANTIC_WEIGHT
            + experience_relevance_score * self.EXPERIENCE_WEIGHT
        )

        return ScoreResult(
            skill_match=round(skill_match_score, 2),
            keyword_match=round(keyword_match_score, 2),
            semantic_similarity=round(semantic_similarity_score, 2),
            experience_relevance=round(experience_relevance_score, 2),
            final_score=round(min(max(final_score, 0), 100), 2),
            matched_skills=matched_skills,
            missing_skills=missing_skills,
        )

    def _semantic_similarity(self, resume_text: str, jd_text: str) -> float:
        model = self._nlp_service.get_sentence_model()
        if model is None:
            return self._lexical_similarity(resume_text, jd_text)

        try:
            embeddings = model.encode([resume_text, jd_text], convert_to_numpy=True)
            a = embeddings[0]
            b = embeddings[1]
            denom = float(np.linalg.norm(a) * np.linalg.norm(b))
            if denom == 0:
                return 0.0
            cosine = float(np.dot(a, b) / denom)
            return max(min((cosine + 1) * 50, 100), 0)
        except Exception:
            return self._lexical_similarity(resume_text, jd_text)

    @staticmethod
    def _lexical_similarity(resume_text: str, jd_text: str) -> float:
        resume_tokens = {token for token in resume_text.lower().split() if len(token) > 2}
        jd_tokens = {token for token in jd_text.lower().split() if len(token) > 2}
        if not resume_tokens or not jd_tokens:
            return 0.0
        overlap = len(resume_tokens & jd_tokens)
        union = len(resume_tokens | jd_tokens)
        return (overlap / union) * 100

    @staticmethod
    def _experience_score(resume_years: float, required_years: float) -> float:
        if required_years <= 0:
            return 70.0 if resume_years <= 0 else 100.0
        ratio = min(resume_years / required_years, 1.0)
        return ratio * 100

