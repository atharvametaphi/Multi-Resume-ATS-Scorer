# Architecture Overview

## Backend (FastAPI + Service Layers)
- `api/v1/routes.py`: HTTP handlers and endpoint contracts.
- `services/analysis_service.py`: orchestration layer for end-to-end analysis.
- `services/extraction_service.py`: extracts text from PDF/DOCX/TXT.
- `services/parser_service.py`: parses sections and skills using taxonomy + spaCy-assisted keywording.
- `services/scoring_service.py`: computes weighted ATS score and match lists.
- `services/suggestion_service.py`: rule-based ATS optimization suggestions.
- `services/report_service.py`: creates downloadable PDF reports in-memory.
- `repositories/analysis_repository.py`: MongoDB + GridFS persistence for analysis artifacts.
- `db/mongodb.py`: Mongo connection bootstrap, schema validators, and indexes.

### MongoDB Schema (`ATS` database)
- Collection `job_descriptions`:
  - `jd_id` (unique string), `source_type`, `source_name`, `text`, `keywords[]`, `created_at`
- Collection `resumes`:
  - `resume_id` (unique string), `analysis_id`, `original_filename`, `stored_filename`
  - `file_id` (GridFS ObjectId), `content_type`, `size_bytes`, `extracted_text`, `created_at`
- Collection `reports`:
  - `report_id` (unique string), `analysis_id` (unique), `filename`
  - `file_id` (GridFS ObjectId), `content_type`, `size_bytes`, `created_at`
- Collection `analyses`:
  - `analysis_id` (unique string), `resume_id`, `jd_id`, `report_id`
  - `resume_filename`, `jd_source`, `ats_score`, `score_breakdown`
  - `matched_skills_preview`, `missing_skills_preview`, `payload`, `created_at`

### File Artifact Storage
- Resume binaries are stored in GridFS with the exact uploaded filename.
- Generated PDF reports are stored in GridFS and streamed by `/analysis/{analysis_id}/report`.

## Frontend (React + TypeScript)
- `features/upload`: drag-and-drop resume upload and JD inputs.
- `features/dashboard`: score summary cards and ATS breakdown panels.
- `features/analysis`: skill match/missing lists and suggestions panel.
- `components/charts`: ATS gauge, pie chart, and progress visualization.
- `hooks/useAnalysis.ts`: frontend analysis state and API execution flow.
- `services/api.ts`: typed API client utilities.

## Extensibility
- FastAPI routes are already versioned under `/api/v1`.
- Core logic is isolated in services/repositories for straightforward scaling.
- Scoring and parser components can be swapped with richer AI models without touching API route contracts.
