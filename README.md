# AI Resume Analyzer + ATS Scorer

Full-stack monorepo for analyzing resumes against job descriptions with ATS-focused scoring, skill matching, and actionable improvements.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS + Recharts
- Backend: FastAPI + Python service architecture
- AI/NLP: sentence-transformers + spaCy
- Resume Parsing: PyMuPDF + python-docx
- Persistence: MongoDB (`ATS` database) + GridFS for resume/report files

## Features (v1)
- Resume upload (`.pdf`, `.docx`)
- Job description input (manual text or `.pdf`/`.docx`/`.txt` file)
- Resume parsing: skills, experience, education, certifications, projects
- ATS scoring with weighted breakdown:
  - Skill match: 40%
  - Keyword match: 20%
  - Semantic similarity: 25%
  - Experience relevance: 15%
- Rule-based AI suggestions for ATS optimization
- Dashboard UI with cards, gauge, pie chart, and progress bars
- Downloadable PDF analysis report

## Project Structure
```text
backend/
  app/
    api/v1/
    core/
    db/
    models/
    repositories/
    schemas/
    services/
    utils/
    data/skills_taxonomy.json
  tests/
frontend/
  src/
    components/
    features/{upload,analysis,dashboard}
    hooks/
    services/
    types/
    styles/
  tests/
sample_data/
docs/
```

## Bootstrap Setup
1. Create virtual environment (already created in this workspace as `venv`):
```powershell
python -m venv venv
```

2. Install backend dependencies:
```powershell
venv\Scripts\python -m pip install -r backend\requirements.txt
venv\Scripts\python -m spacy download en_core_web_sm
```

3. Install frontend dependencies:
```powershell
cd frontend
cmd /c npm install
```

4. Environment:
- Root `.env` is included.
- Additional templates:
  - `backend/.env.example`
  - `frontend/.env.example`

## Run the App
1. Backend:
```powershell
cd backend
..\venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Frontend:
```powershell
cd frontend
cmd /c npm run dev
```

3. Open:
- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`

## API Endpoints
- `GET /api/v1/health`
- `GET /api/v1/job-descriptions`
- `POST /api/v1/analyze` (multipart: `resume_file`, and either `jd_text` or `jd_file`)
- `GET /api/v1/analysis/{analysis_id}`
- `GET /api/v1/analysis/{analysis_id}/report`

## Testing
- Backend:
```powershell
cd backend
..\venv\Scripts\python -m pytest -q
```

- Frontend:
```powershell
cd frontend
cmd /c npm run test:run
```

## Build (Frontend)
```powershell
cd frontend
cmd /c npm run build
```

## Sample Inputs
- `sample_data/sample_resume.pdf`
- `sample_data/sample_resume.docx`
- `sample_data/sample_job_description.txt`

## Notes
- Scanned image PDFs (OCR) are out of scope for v1.
- Analysis payloads are persisted in MongoDB collection `analyses`.
- JDs are persisted in `job_descriptions`.
- Resume files and report PDFs are stored in GridFS with metadata in `resumes` and `reports`.
- Predefined recruiter JDs are seeded into MongoDB at startup and consumed by the frontend (no hardcoded JDs in UI).
- On this machine, PowerShell script execution policy blocks `npm.ps1`; use `cmd /c npm ...` as shown above.
