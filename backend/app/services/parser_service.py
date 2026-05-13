from __future__ import annotations

import json
import re
from pathlib import Path

from app.schemas.internal import ParsedResumeData
from app.services.nlp_service import NLPService, get_nlp_service
from app.utils.text_utils import (
    extract_years_of_experience,
    normalize_text,
    to_unique_preserving_order,
)


SECTION_HEADERS = {
    "experience": ["experience", "work experience", "professional experience", "employment"],
    "education": ["education", "academic background", "academics"],
    "certifications": ["certifications", "certificates", "licenses"],
    "projects": ["projects", "project work", "key projects"],
    "skills": ["skills", "technical skills", "tech stack"],
}


class ParserService:
    def __init__(self, nlp_service: NLPService | None = None) -> None:
        self._nlp_service = nlp_service or get_nlp_service()
        self.skills_taxonomy = self._load_skills_taxonomy()

    @staticmethod
    def _load_skills_taxonomy() -> list[str]:
        skills_path = Path(__file__).resolve().parents[1] / "data" / "skills_taxonomy.json"
        data = json.loads(skills_path.read_text(encoding="utf-8"))
        return [skill.strip() for skill in data.get("skills", []) if skill.strip()]

    def parse_resume(self, resume_text: str, jd_keywords: set[str] | None = None) -> ParsedResumeData:
        clean_text = normalize_text(resume_text)
        lines = [line.strip(" -•\t") for line in clean_text.splitlines() if line.strip()]
        section_map = self._extract_sections(lines)

        skills = self.extract_skills(clean_text)
        experience = self._fallback_section(
            section_map["experience"],
            lines,
            pattern=r"(engineer|developer|intern|consultant|analyst|manager|company|worked)",
        )
        education = self._fallback_section(
            section_map["education"],
            lines,
            pattern=r"(bachelor|master|b\.tech|m\.tech|university|college|school|degree)",
        )
        certifications = self._fallback_section(
            section_map["certifications"],
            lines,
            pattern=r"(certified|certificate|certification|aws|azure|gcp|scrum)",
        )
        projects = self._fallback_section(
            section_map["projects"],
            lines,
            pattern=r"(project|built|developed|implemented|designed)",
        )

        keyword_hits = self._extract_keyword_hits(clean_text, jd_keywords or set())
        total_experience_years = extract_years_of_experience(clean_text)

        return ParsedResumeData(
            skills=skills,
            experience=experience,
            education=education,
            certifications=certifications,
            projects=projects,
            keyword_hits=keyword_hits,
            total_experience_years=total_experience_years,
        )

    def parse_job_description(self, jd_text: str) -> dict[str, object]:
        clean_text = normalize_text(jd_text)
        required_skills = self.extract_skills(clean_text)
        extracted_keywords = self.extract_keywords(clean_text)
        required_experience_years = extract_years_of_experience(clean_text)
        return {
            "required_skills": required_skills,
            "keywords": extracted_keywords,
            "required_experience_years": required_experience_years,
        }

    def extract_skills(self, text: str) -> list[str]:
        text_lower = text.lower()
        hits = [skill for skill in self.skills_taxonomy if skill.lower() in text_lower]
        return to_unique_preserving_order(hits)

    def extract_keywords(self, text: str) -> list[str]:
        nlp = self._nlp_service.get_spacy_nlp()
        doc = nlp(text)
        candidates: list[str] = []

        for token in doc:
            if token.is_stop or token.is_punct or not token.text.strip():
                continue
            if token.pos_ in {"NOUN", "PROPN", "ADJ"} and len(token.text) > 2:
                candidates.append(token.lemma_.lower())

        try:
            for chunk in doc.noun_chunks:
                value = chunk.text.strip().lower()
                if 1 < len(value.split()) <= 4:
                    candidates.append(value)
        except Exception:
            pass

        return to_unique_preserving_order(candidates)[:60]

    @staticmethod
    def _extract_sections(lines: list[str]) -> dict[str, list[str]]:
        mapped: dict[str, list[str]] = {name: [] for name in SECTION_HEADERS}
        current_section: str | None = None

        for line in lines:
            normalized = line.lower().strip().strip(":")
            detected = ParserService._detect_section(normalized)
            if detected:
                current_section = detected
                continue
            if current_section:
                mapped[current_section].append(line)
        return mapped

    @staticmethod
    def _detect_section(line: str) -> str | None:
        for section_name, headers in SECTION_HEADERS.items():
            for header in headers:
                if line == header or line.startswith(f"{header}:"):
                    return section_name
        return None

    @staticmethod
    def _fallback_section(seed: list[str], lines: list[str], pattern: str) -> list[str]:
        if seed:
            return to_unique_preserving_order(seed)[:8]
        regex = re.compile(pattern, re.IGNORECASE)
        matches = [line for line in lines if regex.search(line)]
        return to_unique_preserving_order(matches)[:8]

    @staticmethod
    def _extract_keyword_hits(resume_text: str, jd_keywords: set[str]) -> list[str]:
        if not jd_keywords:
            return []
        resume_lower = resume_text.lower()
        hits = [keyword for keyword in jd_keywords if keyword and keyword in resume_lower]
        return to_unique_preserving_order(hits)[:30]
