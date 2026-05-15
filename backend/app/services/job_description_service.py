from __future__ import annotations

from app.data.predefined_job_descriptions import PREDEFINED_JOB_DESCRIPTIONS, PredefinedJobDescription
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.job_description import JobDescriptionResponse


class JobDescriptionService:
    def __init__(self) -> None:
        self.repo = AnalysisRepository()

    def seed_predefined_job_descriptions(self) -> None:
        for item in PREDEFINED_JOB_DESCRIPTIONS:
            self.repo.upsert_job_description(
                jd_id=item["jd_id"],
                job_title=item["job_title"],
                experience=item["experience"],
                location=item["location"],
                jd_text=self._compose_jd_text(item),
                required_skills=item["required_skills"],
                preferred_skills=item["preferred_skills"],
                qualification=item["qualification"],
            )

    def list_job_descriptions(self) -> list[JobDescriptionResponse]:
        docs = self.repo.list_job_descriptions()
        return [
            JobDescriptionResponse(
                jd_id=str(doc.get("jd_id", "")),
                job_title=str(doc.get("job_title", "")),
                experience=str(doc.get("experience", "")),
                location=str(doc.get("location", "")),
                jd_text=str(doc.get("text", "")),
                required_skills=[str(skill) for skill in doc.get("required_skills", [])],
                preferred_skills=[str(skill) for skill in doc.get("preferred_skills", [])],
                qualification=[str(line) for line in doc.get("qualification", [])],
            )
            for doc in docs
        ]

    @staticmethod
    def _compose_jd_text(item: PredefinedJobDescription) -> str:
        lines: list[str] = [
            f"Job Title: {item['job_title']}",
            f"Experience: {item['experience']}",
            f"Location: {item['location']}",
            "",
            f"Job Summary: {item['summary']}",
            "",
            "Key Responsibilities:",
        ]
        lines.extend(f"- {line}" for line in item["key_responsibilities"])
        lines.extend(["", "Required Skills:"])
        lines.extend(f"- {skill}" for skill in item["required_skills"])
        lines.extend(["", "Preferred Skills:"])
        lines.extend(f"- {skill}" for skill in item["preferred_skills"])
        lines.extend(["", "Qualification:"])
        lines.extend(f"- {line}" for line in item["qualification"])
        return "\n".join(lines)
