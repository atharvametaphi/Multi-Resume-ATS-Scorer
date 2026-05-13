from __future__ import annotations

from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    skill_match: float = Field(ge=0, le=100)
    keyword_match: float = Field(ge=0, le=100)
    semantic_similarity: float = Field(ge=0, le=100)
    experience_relevance: float = Field(ge=0, le=100)
    final_score: float = Field(ge=0, le=100)


class ParsedSections(BaseModel):
    skills: list[str]
    experience: list[str]
    education: list[str]
    certifications: list[str]
    projects: list[str]
    keyword_hits: list[str]


class Suggestion(BaseModel):
    category: str
    message: str


class AnalysisResponse(BaseModel):
    analysis_id: str
    ats_score: float = Field(ge=0, le=100)
    score_breakdown: ScoreBreakdown
    matched_skills: list[str]
    missing_skills: list[str]
    semantic_similarity: float = Field(ge=0, le=100)
    parsed_sections: ParsedSections
    suggestions: list[Suggestion]
    report_url: str


class AnalysisSummaryResponse(BaseModel):
    analysis_id: str
    resume_filename: str
    jd_source: str
    ats_score: float
    score_breakdown: ScoreBreakdown
    report_url: str
    analysis_json_path: str
    created_at: str


class HealthResponse(BaseModel):
    status: str
    service: str

