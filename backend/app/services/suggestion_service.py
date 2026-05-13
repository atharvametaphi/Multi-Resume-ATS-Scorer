from __future__ import annotations

import re

from app.schemas.analysis import Suggestion
from app.schemas.internal import ParsedResumeData, ScoreResult


WEAK_VERB_MAP = {
    "helped": "Designed and delivered",
    "worked on": "Led development of",
    "responsible for": "Owned",
    "did": "Implemented",
    "made": "Built",
}


class SuggestionService:
    def generate(
        self,
        resume_text: str,
        parsed_resume: ParsedResumeData,
        score_result: ScoreResult,
    ) -> list[Suggestion]:
        suggestions: list[Suggestion] = []

        if score_result.missing_skills:
            top_missing = ", ".join(score_result.missing_skills[:6])
            suggestions.append(
                Suggestion(
                    category="Missing Keywords",
                    message=f"Add evidence-based mentions of: {top_missing}.",
                )
            )

        weak_rewrites = self._weak_verb_rewrites(resume_text)
        if weak_rewrites:
            suggestions.append(
                Suggestion(
                    category="Better Wording",
                    message=f"Replace weak phrasing like: {', '.join(weak_rewrites[:3])}.",
                )
            )

        missing_sections = self._missing_sections(parsed_resume)
        if missing_sections:
            suggestions.append(
                Suggestion(
                    category="Section Completeness",
                    message=f"Consider adding stronger content for: {', '.join(missing_sections)}.",
                )
            )

        if len(resume_text.split()) > 900:
            suggestions.append(
                Suggestion(
                    category="ATS Optimization",
                    message="Resume is lengthy. Keep it concise and prioritize impact-focused bullets.",
                )
            )

        if not suggestions:
            suggestions.append(
                Suggestion(
                    category="General",
                    message="Good baseline resume. Add quantifiable outcomes for each key project and role.",
                )
            )
        return suggestions

    @staticmethod
    def _weak_verb_rewrites(resume_text: str) -> list[str]:
        findings: list[str] = []
        text_lower = resume_text.lower()
        for weak_phrase, better_phrase in WEAK_VERB_MAP.items():
            if re.search(rf"\b{re.escape(weak_phrase)}\b", text_lower):
                findings.append(f"'{weak_phrase}' -> '{better_phrase}'")
        return findings

    @staticmethod
    def _missing_sections(parsed_resume: ParsedResumeData) -> list[str]:
        gaps: list[str] = []
        if not parsed_resume.experience:
            gaps.append("Experience")
        if not parsed_resume.projects:
            gaps.append("Projects")
        if not parsed_resume.education:
            gaps.append("Education")
        if not parsed_resume.certifications:
            gaps.append("Certifications")
        return gaps

