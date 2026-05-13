from __future__ import annotations

from app.schemas.internal import ParsedResumeData, ScoreResult
from app.services.suggestion_service import SuggestionService


def test_suggestions_include_missing_skills_and_wording():
    service = SuggestionService()
    parsed_resume = ParsedResumeData(
        skills=["Python"],
        experience=[],
        education=["B.Tech"],
        certifications=[],
        projects=[],
        keyword_hits=["python"],
        total_experience_years=1.0,
    )
    score_result = ScoreResult(
        skill_match=25.0,
        keyword_match=25.0,
        semantic_similarity=40.0,
        experience_relevance=33.0,
        final_score=31.7,
        matched_skills=["Python"],
        missing_skills=["FastAPI", "SQL"],
    )

    suggestions = service.generate(
        resume_text="Helped team and worked on backend tasks.",
        parsed_resume=parsed_resume,
        score_result=score_result,
    )
    messages = " ".join([suggestion.message for suggestion in suggestions]).lower()

    assert any(suggestion.category == "Missing Keywords" for suggestion in suggestions)
    assert "fastapi" in messages
    assert "worked on" in messages

