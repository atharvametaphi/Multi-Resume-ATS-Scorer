from __future__ import annotations

from pydantic import BaseModel


class JobDescriptionResponse(BaseModel):
    jd_id: str
    job_title: str
    experience: str
    location: str
    jd_text: str
    required_skills: list[str]
    preferred_skills: list[str]
    qualification: list[str]
