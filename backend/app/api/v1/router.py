from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.routes import router as resume_router


api_router = APIRouter()
api_router.include_router(resume_router)

