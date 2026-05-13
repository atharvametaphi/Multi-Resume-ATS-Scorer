from __future__ import annotations

from pathlib import Path
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from app.core.config import get_settings


class ReportService:
    def __init__(self) -> None:
        self.settings = get_settings()

    def build_report(self, analysis_id: str, payload: dict[str, Any]) -> Path:
        self.settings.report_absolute_dir.mkdir(parents=True, exist_ok=True)
        target = self.settings.report_absolute_dir / f"{analysis_id}.pdf"
        self._draw_pdf(target, payload)
        return target

    def _draw_pdf(self, file_path: Path, payload: dict[str, Any]) -> None:
        c = canvas.Canvas(str(file_path), pagesize=A4)
        width, height = A4
        y = height - 60

        c.setFillColor(colors.HexColor("#0f172a"))
        c.setFont("Helvetica-Bold", 18)
        c.drawString(50, y, "AI Resume Analyzer Report")

        y -= 28
        c.setFont("Helvetica", 11)
        c.setFillColor(colors.HexColor("#475569"))
        c.drawString(50, y, f"Analysis ID: {payload['analysis_id']}")

        y -= 28
        c.setFont("Helvetica-Bold", 28)
        c.setFillColor(colors.HexColor("#0ea5e9"))
        c.drawString(50, y, f"ATS Score: {payload['ats_score']}/100")

        y -= 36
        c.setFillColor(colors.HexColor("#0f172a"))
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Score Breakdown")
        y -= 18
        c.setFont("Helvetica", 11)
        breakdown = payload["score_breakdown"]
        for label, value in [
            ("Skill Match", breakdown["skill_match"]),
            ("Keyword Match", breakdown["keyword_match"]),
            ("Semantic Similarity", breakdown["semantic_similarity"]),
            ("Experience Relevance", breakdown["experience_relevance"]),
        ]:
            c.drawString(60, y, f"- {label}: {value}")
            y -= 16

        y -= 12
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Matched Skills")
        y -= 18
        c.setFont("Helvetica", 11)
        c.drawString(60, y, ", ".join(payload["matched_skills"][:12]) or "None")

        y -= 28
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Missing Skills")
        y -= 18
        c.setFont("Helvetica", 11)
        c.drawString(60, y, ", ".join(payload["missing_skills"][:12]) or "None")

        y -= 28
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Suggestions")
        y -= 18
        c.setFont("Helvetica", 11)
        for suggestion in payload["suggestions"][:6]:
            text = f"- [{suggestion['category']}] {suggestion['message']}"
            for chunk in self._wrap_line(text, 96):
                if y < 60:
                    c.showPage()
                    y = height - 50
                    c.setFont("Helvetica", 11)
                c.drawString(60, y, chunk)
                y -= 15

        c.save()

    @staticmethod
    def _wrap_line(text: str, max_chars: int) -> list[str]:
        words = text.split()
        lines: list[str] = []
        current = []
        for word in words:
            if len(" ".join(current + [word])) > max_chars and current:
                lines.append(" ".join(current))
                current = [word]
            else:
                current.append(word)
        if current:
            lines.append(" ".join(current))
        return lines

