from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ParsedResumeData:
    skills: list[str]
    experience: list[str]
    education: list[str]
    certifications: list[str]
    projects: list[str]
    keyword_hits: list[str]
    total_experience_years: float


@dataclass
class ScoreResult:
    skill_match: float
    keyword_match: float
    semantic_similarity: float
    experience_relevance: float
    final_score: float
    matched_skills: list[str]
    missing_skills: list[str]

