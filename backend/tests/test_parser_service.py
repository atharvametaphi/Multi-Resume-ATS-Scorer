from __future__ import annotations

from app.services.parser_service import ParserService


def test_parser_extracts_sections_and_skills(sample_resume_text: str):
    parser = ParserService()
    jd_keywords = {"python", "fastapi", "sql"}
    parsed = parser.parse_resume(sample_resume_text, jd_keywords=jd_keywords)

    assert "Python" in parsed.skills
    assert parsed.experience
    assert parsed.education
    assert parsed.projects
    assert "python" in [hit.lower() for hit in parsed.keyword_hits]


def test_parser_extracts_jd_fields(sample_jd_text: str):
    parser = ParserService()
    data = parser.parse_job_description(sample_jd_text)

    assert "required_skills" in data
    assert "keywords" in data
    assert data["required_experience_years"] >= 3

