from __future__ import annotations

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.schemas.analysis import AnalysisResponse, HealthResponse
from app.services.analysis_service import AnalysisService


router = APIRouter()
analysis_service = AnalysisService()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="resume-analyzer-api")


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    resume_file: UploadFile = File(...),
    jd_text: str | None = Form(default=None),
    jd_file: UploadFile | None = File(default=None),
) -> AnalysisResponse:
    return await analysis_service.analyze(
        resume_file=resume_file,
        jd_text=jd_text,
        jd_file=jd_file,
    )


@router.get("/analysis/{analysis_id}")
def get_analysis(analysis_id: str) -> dict:
    summary = analysis_service.get_summary(analysis_id)
    if summary is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    payload = analysis_service.get_analysis_payload(analysis_id)
    return {"summary": summary.model_dump(), "analysis": payload}


@router.get("/analysis/{analysis_id}/report")
def download_report(analysis_id: str):
    report_path = analysis_service.get_report_path(analysis_id)
    if report_path is None:
        raise HTTPException(status_code=404, detail="Report not found.")
    return FileResponse(
        path=report_path,
        media_type="application/pdf",
        filename=f"analysis_{analysis_id}.pdf",
    )

