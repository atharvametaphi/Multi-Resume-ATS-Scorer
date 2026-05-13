from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import get_settings
from app.core.exceptions import InvalidFileError, MissingJobDescriptionError
from app.models.analysis_record import AnalysisRecord
from app.repositories.analysis_repository import AnalysisRepository
from app.schemas.analysis import AnalysisResponse, AnalysisSummaryResponse, ParsedSections, ScoreBreakdown
from app.services.extraction_service import ExtractionService
from app.services.parser_service import ParserService
from app.services.report_service import ReportService
from app.services.scoring_service import ScoringService
from app.services.storage_service import StorageService
from app.services.suggestion_service import SuggestionService
from app.utils.file_utils import ensure_allowed_extension, read_upload_bytes, save_upload_bytes


class AnalysisService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.extractor = ExtractionService()
        self.parser = ParserService()
        self.scorer = ScoringService()
        self.suggester = SuggestionService()
        self.storage = StorageService()
        self.reporter = ReportService()
        self.repo = AnalysisRepository()
        self.storage.ensure_storage_dirs()

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
        resume_path = save_upload_bytes(
            content=resume_content,
            original_filename=resume_file.filename,
            destination_dir=self.settings.upload_absolute_dir,
        )
        try:
            resume_text = self.extractor.extract_text(resume_path)
        except Exception as exc:
            raise InvalidFileError("Could not parse the uploaded resume file.") from exc

        jd_source = "manual_text"
        if jd_text and jd_text.strip():
            resolved_jd_text = jd_text.strip()
        elif jd_file and jd_file.filename:
            jd_source = jd_file.filename
            jd_content = await read_upload_bytes(jd_file, self.settings.max_upload_size_mb)
            ensure_allowed_extension(jd_file.filename, {".pdf", ".docx", ".txt"})
            jd_path = save_upload_bytes(
                content=jd_content,
                original_filename=jd_file.filename,
                destination_dir=self.settings.upload_absolute_dir,
            )
            try:
                resolved_jd_text = self.extractor.extract_text(jd_path)
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

        analysis_json_path = self.storage.save_analysis_payload(analysis_id, response_payload)
        report_path = self.reporter.build_report(analysis_id, response_payload)

        created_at = datetime.now(timezone.utc).isoformat()
        record = AnalysisRecord(
            id=analysis_id,
            resume_filename=resume_file.filename,
            jd_source=jd_source,
            ats_score=score_result.final_score,
            skill_match_score=score_result.skill_match,
            keyword_match_score=score_result.keyword_match,
            semantic_similarity_score=score_result.semantic_similarity,
            experience_relevance_score=score_result.experience_relevance,
            matched_skills_preview=", ".join(score_result.matched_skills[:8]),
            missing_skills_preview=", ".join(score_result.missing_skills[:8]),
            report_path=str(report_path),
            analysis_json_path=str(analysis_json_path),
            created_at=created_at,
        )
        self.repo.save(record)

        return AnalysisResponse(**response_payload)

    def get_summary(self, analysis_id: str) -> AnalysisSummaryResponse | None:
        record = self.repo.get(analysis_id)
        if record is None:
            return None

        return AnalysisSummaryResponse(
            analysis_id=record.id,
            resume_filename=record.resume_filename,
            jd_source=record.jd_source,
            ats_score=record.ats_score,
            score_breakdown=ScoreBreakdown(
                skill_match=record.skill_match_score,
                keyword_match=record.keyword_match_score,
                semantic_similarity=record.semantic_similarity_score,
                experience_relevance=record.experience_relevance_score,
                final_score=record.ats_score,
            ),
            report_url=f"{self.settings.api_v1_prefix}/analysis/{record.id}/report",
            analysis_json_path=record.analysis_json_path,
            created_at=record.created_at,
        )

    def get_analysis_payload(self, analysis_id: str) -> dict | None:
        summary = self.get_summary(analysis_id)
        if summary is None:
            return None
        json_path = Path(summary.analysis_json_path)
        if not json_path.exists():
            return None
        return self.storage.load_json(json_path)

    def get_report_path(self, analysis_id: str) -> Path | None:
        summary = self.get_summary(analysis_id)
        if summary is None:
            return None
        report_path = self.settings.report_absolute_dir / f"{analysis_id}.pdf"
        if not report_path.exists():
            return None
        return report_path
