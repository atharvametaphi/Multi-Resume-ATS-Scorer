from __future__ import annotations

from app.db.database import get_db_connection
from app.models.analysis_record import AnalysisRecord


class AnalysisRepository:
    def save(self, record: AnalysisRecord) -> None:
        query = """
        INSERT INTO analyses (
            id,
            resume_filename,
            jd_source,
            ats_score,
            skill_match_score,
            keyword_match_score,
            semantic_similarity_score,
            experience_relevance_score,
            matched_skills_preview,
            missing_skills_preview,
            report_path,
            analysis_json_path,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        with get_db_connection() as conn:
            conn.execute(
                query,
                (
                    record.id,
                    record.resume_filename,
                    record.jd_source,
                    record.ats_score,
                    record.skill_match_score,
                    record.keyword_match_score,
                    record.semantic_similarity_score,
                    record.experience_relevance_score,
                    record.matched_skills_preview,
                    record.missing_skills_preview,
                    record.report_path,
                    record.analysis_json_path,
                    record.created_at,
                ),
            )
            conn.commit()

    def get(self, analysis_id: str) -> AnalysisRecord | None:
        query = "SELECT * FROM analyses WHERE id = ?"
        with get_db_connection() as conn:
            row = conn.execute(query, (analysis_id,)).fetchone()
            if not row:
                return None
            return AnalysisRecord(
                id=row["id"],
                resume_filename=row["resume_filename"],
                jd_source=row["jd_source"],
                ats_score=row["ats_score"],
                skill_match_score=row["skill_match_score"],
                keyword_match_score=row["keyword_match_score"],
                semantic_similarity_score=row["semantic_similarity_score"],
                experience_relevance_score=row["experience_relevance_score"],
                matched_skills_preview=row["matched_skills_preview"],
                missing_skills_preview=row["missing_skills_preview"],
                report_path=row["report_path"],
                analysis_json_path=row["analysis_json_path"],
                created_at=row["created_at"],
            )

