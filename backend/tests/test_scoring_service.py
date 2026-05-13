from __future__ import annotations

from app.schemas.internal import ParsedResumeData
from app.services.scoring_service import ScoringService


def test_scoring_weights_and_ranges():
    service = ScoringService()
    parsed_resume = ParsedResumeData(
        skills=["Python", "FastAPI", "SQL"],
        experience=["Software Engineer - 4 years"],
        education=["B.Tech"],
        certifications=["AWS Certified"],
        projects=["Resume Analyzer"],
        keyword_hits=["python", "api"],
        total_experience_years=4.0,
    )
    jd_data = {
        "required_skills": ["Python", "FastAPI", "Docker", "SQL"],
        "keywords": ["python", "api", "rest", "docker"],
        "required_experience_years": 3,
    }

    result = service.score(
        parsed_resume=parsed_resume,
        jd_data=jd_data,
        resume_text="Python FastAPI SQL developer",
        jd_text="Python FastAPI Docker SQL REST",
    )

    assert 0 <= result.final_score <= 100
    assert result.skill_match > 0
    assert "Docker" in result.missing_skills
    assert result.experience_relevance == 100

