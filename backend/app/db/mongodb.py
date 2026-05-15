from __future__ import annotations

from functools import lru_cache
from typing import Any

from pymongo import ASCENDING, MongoClient
from pymongo.database import Database
from pymongo.errors import CollectionInvalid, OperationFailure

from app.core.config import get_settings


@lru_cache
def get_mongo_client() -> MongoClient:
    settings = get_settings()
    return MongoClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=settings.mongodb_connect_timeout_ms,
        connectTimeoutMS=settings.mongodb_connect_timeout_ms,
    )


def get_mongo_database() -> Database:
    settings = get_settings()
    return get_mongo_client()[settings.mongodb_db_name]


def _ensure_collection(db: Database, name: str, validator: dict[str, Any]) -> None:
    if name in db.list_collection_names():
        try:
            db.command({"collMod": name, "validator": validator, "validationLevel": "moderate"})
        except OperationFailure:
            # collMod can fail in restricted/dev setups. Indexes still protect consistency.
            pass
        return

    try:
        db.create_collection(name, validator=validator, validationLevel="moderate")
    except CollectionInvalid:
        pass


def init_mongodb() -> None:
    db = get_mongo_database()
    db.client.admin.command("ping")

    _ensure_collection(
        db,
        "job_descriptions",
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["jd_id", "source_type", "text", "created_at"],
                "properties": {
                    "jd_id": {"bsonType": "string"},
                    "source_type": {"bsonType": "string"},
                    "source_name": {"bsonType": ["string", "null"]},
                    "text": {"bsonType": "string"},
                    "keywords": {"bsonType": "array", "items": {"bsonType": "string"}},
                    "created_at": {"bsonType": "date"},
                },
            }
        },
    )

    _ensure_collection(
        db,
        "resumes",
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "resume_id",
                    "analysis_id",
                    "original_filename",
                    "stored_filename",
                    "file_id",
                    "content_type",
                    "size_bytes",
                    "created_at",
                ],
                "properties": {
                    "resume_id": {"bsonType": "string"},
                    "analysis_id": {"bsonType": "string"},
                    "original_filename": {"bsonType": "string"},
                    "stored_filename": {"bsonType": "string"},
                    "file_id": {"bsonType": "objectId"},
                    "content_type": {"bsonType": "string"},
                    "size_bytes": {"bsonType": "int"},
                    "extracted_text": {"bsonType": "string"},
                    "created_at": {"bsonType": "date"},
                },
            }
        },
    )

    _ensure_collection(
        db,
        "reports",
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "report_id",
                    "analysis_id",
                    "filename",
                    "file_id",
                    "content_type",
                    "size_bytes",
                    "created_at",
                ],
                "properties": {
                    "report_id": {"bsonType": "string"},
                    "analysis_id": {"bsonType": "string"},
                    "filename": {"bsonType": "string"},
                    "file_id": {"bsonType": "objectId"},
                    "content_type": {"bsonType": "string"},
                    "size_bytes": {"bsonType": "int"},
                    "created_at": {"bsonType": "date"},
                },
            }
        },
    )

    _ensure_collection(
        db,
        "analyses",
        {
            "$jsonSchema": {
                "bsonType": "object",
                "required": [
                    "analysis_id",
                    "resume_id",
                    "jd_id",
                    "report_id",
                    "resume_filename",
                    "jd_source",
                    "ats_score",
                    "score_breakdown",
                    "payload",
                    "created_at",
                ],
                "properties": {
                    "analysis_id": {"bsonType": "string"},
                    "resume_id": {"bsonType": "string"},
                    "jd_id": {"bsonType": "string"},
                    "report_id": {"bsonType": "string"},
                    "resume_filename": {"bsonType": "string"},
                    "jd_source": {"bsonType": "string"},
                    "ats_score": {"bsonType": ["double", "int"]},
                    "score_breakdown": {"bsonType": "object"},
                    "matched_skills_preview": {"bsonType": "string"},
                    "missing_skills_preview": {"bsonType": "string"},
                    "payload": {"bsonType": "object"},
                    "created_at": {"bsonType": "date"},
                },
            }
        },
    )

    db.job_descriptions.create_index([("jd_id", ASCENDING)], unique=True)
    db.resumes.create_index([("resume_id", ASCENDING)], unique=True)
    db.resumes.create_index([("analysis_id", ASCENDING)])
    db.reports.create_index([("report_id", ASCENDING)], unique=True)
    db.reports.create_index([("analysis_id", ASCENDING)], unique=True)
    db.analyses.create_index([("analysis_id", ASCENDING)], unique=True)
    db.analyses.create_index([("created_at", ASCENDING)])
