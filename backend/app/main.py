from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import InvalidFileError, MissingJobDescriptionError, ResumeAnalyzerError
from app.db.mongodb import init_mongodb
from app.services.job_description_service import JobDescriptionService


settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_mongodb()
    JobDescriptionService().seed_predefined_job_descriptions()
    yield

app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.exception_handler(InvalidFileError)
async def invalid_file_handler(_: Request, exc: InvalidFileError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(MissingJobDescriptionError)
async def missing_jd_handler(_: Request, exc: MissingJobDescriptionError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(ResumeAnalyzerError)
async def domain_error_handler(_: Request, exc: ResumeAnalyzerError):
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.get("/")
def index() -> dict[str, str]:
    return {"message": "AI Resume Analyzer backend is running."}
