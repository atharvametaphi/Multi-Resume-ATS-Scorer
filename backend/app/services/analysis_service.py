from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import InvalidFileError, MissingJobDescriptionError
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import AnalysisResponse, AnalysisSummaryResponse, ScoreBreakdown
from app.services.extraction_service import ExtractionService
from app.services.parser_service import ParserService
from app.services.report_service import ReportService
from app.services.scoring_service import ScoringService
from app.services.suggestion_service import SuggestionService
from app.utils.file_utils import ensure_allowed_extension, read_upload_bytes


class AnalysisService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.extractor = ExtractionService()
        self.parser = ParserService()
        self.scorer = ScoringService()
        self.suggester = SuggestionService()
        self.reporter = ReportService()
        self.repo = AnalysisRepository()

    async def analyze(
        self,
        resume_file: UploadFile,
        jd_text: str | None,
        jd_file: UploadFile | None,
    ) -> AnalysisResponse:
        if not resume_file.filename:
            raise InvalidFileError("Resume file must include a filename.")

        resume_content = await read_upload_bytes(resume_file, self.settings.max_upload_size_mb)
        ensure_allowed_extension(resume_file.filename, {".pdf", ".docx"})
        try:
            resume_text = self.extractor.extract_text_from_bytes(resume_content, resume_file.filename)
        except Exception as exc:
            raise InvalidFileError("Could not parse the uploaded resume file.") from exc

        jd_source = "manual_text"
        jd_source_name: str | None = None
        jd_source_type = "manual_text"
        if jd_text and jd_text.strip():
            resolved_jd_text = jd_text.strip()
        elif jd_file and jd_file.filename:
            jd_source = jd_file.filename
            jd_source_name = jd_file.filename
            jd_source_type = "file_upload"
            jd_content = await read_upload_bytes(jd_file, self.settings.max_upload_size_mb)
            ensure_allowed_extension(jd_file.filename, {".pdf", ".docx", ".txt"})
            try:
                resolved_jd_text = self.extractor.extract_text_from_bytes(jd_content, jd_file.filename)
            except Exception as exc:
                raise InvalidFileError("Could not parse the uploaded job description file.") from exc
        else:
            raise MissingJobDescriptionError("Provide either JD text or a JD file.")

        jd_data = self.parser.parse_job_description(resolved_jd_text)
        jd_keywords = set(str(keyword).lower() for keyword in jd_data.get("keywords", []))
        parsed_resume = self.parser.parse_resume(resume_text=resume_text, jd_keywords=jd_keywords)
        score_result = self.scorer.score(
            parsed_resume=parsed_resume,
            jd_data=jd_data,
            resume_text=resume_text,
            jd_text=resolved_jd_text,
        )
        suggestions = self.suggester.generate(
            resume_text=resume_text,
            parsed_resume=parsed_resume,
            score_result=score_result,
        )

        analysis_id = uuid4().hex
        response_payload = {
            "analysis_id": analysis_id,
            "ats_score": score_result.final_score,
            "score_breakdown": {
                "skill_match": score_result.skill_match,
                "keyword_match": score_result.keyword_match,
                "semantic_similarity": score_result.semantic_similarity,
                "experience_relevance": score_result.experience_relevance,
                "final_score": score_result.final_score,
            },
            "matched_skills": score_result.matched_skills,
            "missing_skills": score_result.missing_skills,
            "semantic_similarity": score_result.semantic_similarity,
            "parsed_sections": {
                "skills": parsed_resume.skills,
                "experience": parsed_resume.experience,
                "education": parsed_resume.education,
                "certifications": parsed_resume.certifications,
                "projects": parsed_resume.projects,
                "keyword_hits": parsed_resume.keyword_hits,
            },
            "suggestions": [suggestion.model_dump() for suggestion in suggestions],
            "report_url": f"{self.settings.api_v1_prefix}/analysis/{analysis_id}/report",
        }

        report_bytes = self.reporter.build_report_bytes(response_payload)

        jd_id = self.repo.save_job_description(
            source_type=jd_source_type,
            source_name=jd_source_name,
            text=resolved_jd_text,
            keywords=[str(keyword) for keyword in jd_data.get("keywords", [])],
        )
        resume_id = self.repo.save_resume_file(
            analysis_id=analysis_id,
            original_filename=resume_file.filename,
            content_type=resume_file.content_type or "application/octet-stream",
            file_bytes=resume_content,
            extracted_text=resume_text,
        )
        report_id = self.repo.save_report_file(analysis_id=analysis_id, report_bytes=report_bytes)

        self.repo.save_analysis(
            analysis_id=analysis_id,
            resume_id=resume_id,
            jd_id=jd_id,
            report_id=report_id,
            resume_filename=resume_file.filename,
            jd_source=jd_source,
            ats_score=score_result.final_score,
            score_breakdown=response_payload["score_breakdown"],
            matched_skills_preview=", ".join(score_result.matched_skills[:8]),
            missing_skills_preview=", ".join(score_result.missing_skills[:8]),
            payload=response_payload,
        )

        return AnalysisResponse(**response_payload)

    def get_summary(self, analysis_id: str) -> AnalysisSummaryResponse | None:
        record = self.repo.get_analysis(analysis_id)
        if record is None:
            return None

        score_breakdown = record.get("score_breakdown") or {}
        created_at = record.get("created_at")
        if isinstance(created_at, datetime):
            created_at_iso = created_at.astimezone(timezone.utc).isoformat()
        else:
            created_at_iso = str(created_at)

        return AnalysisSummaryResponse(
            analysis_id=record["analysis_id"],
            resume_filename=record["resume_filename"],
            jd_source=record["jd_source"],
            ats_score=float(record["ats_score"]),
            score_breakdown=ScoreBreakdown(
                skill_match=float(score_breakdown.get("skill_match", 0)),
                keyword_match=float(score_breakdown.get("keyword_match", 0)),
                semantic_similarity=float(score_breakdown.get("semantic_similarity", 0)),
                experience_relevance=float(score_breakdown.get("experience_relevance", 0)),
                final_score=float(score_breakdown.get("final_score", record["ats_score"])),
            ),
            report_url=f"{self.settings.api_v1_prefix}/analysis/{record['analysis_id']}/report",
            analysis_json_path=f"mongodb://{self.settings.mongodb_db_name}/analyses/{record['analysis_id']}",
            created_at=created_at_iso,
        )

    def get_analysis_payload(self, analysis_id: str) -> dict | None:
        record = self.repo.get_analysis(analysis_id)
        if record is None:
            return None
        payload = record.get("payload")
        if not isinstance(payload, dict):
            return None
        return payload

    def get_report_bytes(self, analysis_id: str) -> bytes | None:
        return self.repo.get_report_bytes(analysis_id)
