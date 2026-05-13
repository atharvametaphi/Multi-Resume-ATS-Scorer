from __future__ import annotations

from dataclasses import dataclass


@dataclass
class AnalysisRecord:
    id: str
    resume_filename: str
    jd_source: str
    ats_score: float
    skill_match_score: float
    keyword_match_score: float
    semantic_similarity_score: float
    experience_relevance_score: float
    matched_skills_preview: str
    missing_skills_preview: str
    report_path: str
    analysis_json_path: str
    created_at: str

