# Architecture Overview

## Backend (FastAPI + Service Layers)
- `api/v1/routes.py`: HTTP handlers and endpoint contracts.
- `services/analysis_service.py`: orchestration layer for end-to-end analysis.
- `services/extraction_service.py`: extracts text from PDF/DOCX/TXT.
- `services/parser_service.py`: parses sections and skills using taxonomy + spaCy-assisted keywording.
- `services/scoring_service.py`: computes weighted ATS score and match lists.
- `services/suggestion_service.py`: rule-based ATS optimization suggestions.
- `services/report_service.py`: creates downloadable PDF reports.
- `repositories/analysis_repository.py`: SQLite persistence for lightweight metadata.
- `services/storage_service.py`: JSON artifact persistence and storage directory management.

### Hybrid Cache Model
- SQLite stores summary metadata and score snapshots.
- Full analysis payload is persisted to `storage/analyses/<analysis_id>.json`.
- PDF report is persisted to `storage/reports/<analysis_id>.pdf`.

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
