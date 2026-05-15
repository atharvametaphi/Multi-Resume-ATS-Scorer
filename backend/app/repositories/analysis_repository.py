from __future__ import annotations

from datetime import datetime, timezone
from io import BytesIO
from uuid import uuid4

from bson import ObjectId
from pymongo import ASCENDING
from gridfs import GridFSBucket
from gridfs.errors import NoFile

from app.db.mongodb import get_mongo_database


class AnalysisRepository:
    def __init__(self) -> None:
        self.db = get_mongo_database()
        self.job_descriptions = self.db["job_descriptions"]
        self.resumes = self.db["resumes"]
        self.reports = self.db["reports"]
        self.analyses = self.db["analyses"]
        self.fs = GridFSBucket(self.db)

    def upsert_job_description(
        self,
        *,
        jd_id: str,
        job_title: str,
        experience: str,
        location: str,
        jd_text: str,
        required_skills: list[str],
        preferred_skills: list[str],
        qualification: list[str],
    ) -> None:
        keywords = sorted({skill.lower() for skill in required_skills + preferred_skills})
        self.job_descriptions.update_one(
            {"jd_id": jd_id},
            {
                "$set": {
                    "jd_id": jd_id,
                    "source_type": "predefined",
                    "source_name": job_title,
                    "job_title": job_title,
                    "experience": experience,
                    "location": location,
                    "text": jd_text,
                    "keywords": keywords,
                    "required_skills": required_skills,
                    "preferred_skills": preferred_skills,
                    "qualification": qualification,
                    "updated_at": datetime.now(timezone.utc),
                },
                "$setOnInsert": {"created_at": datetime.now(timezone.utc)},
            },
            upsert=True,
        )

    def list_job_descriptions(self) -> list[dict]:
        cursor = self.job_descriptions.find(
            {},
            {
                "_id": 0,
                "jd_id": 1,
                "job_title": 1,
                "experience": 1,
                "location": 1,
                "text": 1,
                "required_skills": 1,
                "preferred_skills": 1,
                "qualification": 1,
            },
        ).sort("job_title", ASCENDING)
        return list(cursor)

    def save_job_description(
        self,
        *,
        source_type: str,
        source_name: str | None,
        text: str,
        keywords: list[str],
    ) -> str:
        jd_id = uuid4().hex
        self.job_descriptions.insert_one(
            {
                "jd_id": jd_id,
                "source_type": source_type,
                "source_name": source_name,
                "text": text,
                "keywords": keywords,
                "created_at": datetime.now(timezone.utc),
            }
        )
        return jd_id

    def save_resume_file(
        self,
        *,
        analysis_id: str,
        original_filename: str,
        content_type: str,
        file_bytes: bytes,
        extracted_text: str,
    ) -> str:
        # Requirement: preserve the exact uploaded filename.
        file_id = self.fs.upload_from_stream(
            original_filename,
            BytesIO(file_bytes),
            metadata={"analysis_id": analysis_id, "kind": "resume"},
        )
        resume_id = uuid4().hex
        self.resumes.insert_one(
            {
                "resume_id": resume_id,
                "analysis_id": analysis_id,
                "original_filename": original_filename,
                "stored_filename": original_filename,
                "file_id": file_id,
                "content_type": content_type,
                "size_bytes": len(file_bytes),
                "extracted_text": extracted_text,
                "created_at": datetime.now(timezone.utc),
            }
        )
        return resume_id

    def save_report_file(
        self,
        *,
        analysis_id: str,
        report_bytes: bytes,
    ) -> str:
        report_id = uuid4().hex
        filename = f"analysis_{analysis_id}.pdf"
        file_id = self.fs.upload_from_stream(
            filename,
            BytesIO(report_bytes),
            metadata={"analysis_id": analysis_id, "kind": "report"},
        )
        self.reports.insert_one(
            {
                "report_id": report_id,
                "analysis_id": analysis_id,
                "filename": filename,
                "file_id": file_id,
                "content_type": "application/pdf",
                "size_bytes": len(report_bytes),
                "created_at": datetime.now(timezone.utc),
            }
        )
        return report_id

    def save_analysis(
        self,
        *,
        analysis_id: str,
        resume_id: str,
        jd_id: str,
        report_id: str,
        resume_filename: str,
        jd_source: str,
        ats_score: float,
        score_breakdown: dict,
        matched_skills_preview: str,
        missing_skills_preview: str,
        payload: dict,
    ) -> None:
        self.analyses.insert_one(
            {
                "analysis_id": analysis_id,
                "resume_id": resume_id,
                "jd_id": jd_id,
                "report_id": report_id,
                "resume_filename": resume_filename,
                "jd_source": jd_source,
                "ats_score": ats_score,
                "score_breakdown": score_breakdown,
                "matched_skills_preview": matched_skills_preview,
                "missing_skills_preview": missing_skills_preview,
                "payload": payload,
                "created_at": datetime.now(timezone.utc),
            }
        )

    def get_analysis(self, analysis_id: str) -> dict | None:
        return self.analyses.find_one({"analysis_id": analysis_id})

    def get_report_bytes(self, analysis_id: str) -> bytes | None:
        report = self.reports.find_one({"analysis_id": analysis_id})
        if not report:
            return None

        file_id = report.get("file_id")
        if not isinstance(file_id, ObjectId):
            return None

        buffer = BytesIO()
        try:
            self.fs.download_to_stream(file_id, buffer)
        except NoFile:
            return None
        buffer.seek(0)
        return buffer.read()
