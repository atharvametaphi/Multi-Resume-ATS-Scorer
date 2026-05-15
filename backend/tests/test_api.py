from __future__ import annotations

from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

from app.api.v1.routes import analysis_service


def _build_pdf_bytes(text: str) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.drawString(72, 720, text)
    pdf.save()
    return buffer.getvalue()


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_job_descriptions_endpoint_returns_seeded_data(client):
    response = client.get("/api/v1/job-descriptions")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) >= 3
    titles = {item["job_title"] for item in payload}
    assert "MERN Stack Developer" in titles
    assert "QA Engineer / Software Test Engineer" in titles
    assert "UI/UX Designer" in titles


def test_analyze_resume_happy_path(client, sample_jd_text, monkeypatch):
    monkeypatch.setattr(analysis_service.scorer, "_semantic_similarity", lambda *_args, **_kwargs: 60.0)  # noqa: SLF001
    resume_pdf = _build_pdf_bytes("Python FastAPI SQL Docker Resume Experience 4 years")
    response = client.post(
        "/api/v1/analyze",
        files={
            "resume_file": ("resume.pdf", resume_pdf, "application/pdf"),
        },
        data={"jd_text": sample_jd_text},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["analysis_id"]
    assert 0 <= payload["ats_score"] <= 100
    assert "score_breakdown" in payload
    assert "suggestions" in payload

    report = client.get(payload["report_url"])
    assert report.status_code == 200
    assert report.headers["content-type"].startswith("application/pdf")


def test_analyze_resume_without_jd_returns_400(client):
    resume_pdf = _build_pdf_bytes("Python FastAPI SQL")
    response = client.post(
        "/api/v1/analyze",
        files={"resume_file": ("resume.pdf", resume_pdf, "application/pdf")},
    )
    assert response.status_code == 400
    assert "Provide either JD text or a JD file" in response.json()["detail"]


def test_analyze_resume_rejects_invalid_extension(client, sample_jd_text):
    response = client.post(
        "/api/v1/analyze",
        files={"resume_file": ("resume.txt", b"hello", "text/plain")},
        data={"jd_text": sample_jd_text},
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]


def test_analyze_resume_rejects_oversized_file(client, sample_jd_text):
    oversized = b"a" * (6 * 1024 * 1024)
    response = client.post(
        "/api/v1/analyze",
        files={"resume_file": ("resume.docx", oversized, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
        data={"jd_text": sample_jd_text},
    )
    assert response.status_code == 400
    assert "exceeds max size" in response.json()["detail"]


def test_analyze_resume_rejects_unparseable_pdf(client, sample_jd_text):
    response = client.post(
        "/api/v1/analyze",
        files={"resume_file": ("resume.pdf", b"not-a-real-pdf", "application/pdf")},
        data={"jd_text": sample_jd_text},
    )
    assert response.status_code == 400
    assert "Could not parse the uploaded resume file" in response.json()["detail"]
