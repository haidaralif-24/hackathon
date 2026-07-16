from __future__ import annotations

from fastapi import APIRouter, Query

from app.database import get_supabase

router = APIRouter(prefix="/records", tags=["records"])


@router.get("")
def list_records(limit: int = Query(20, ge=1, le=100)):
    result = (
        get_supabase()
        .table("records")
        .select("*, files(filename)")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    records = []
    for row in result.data or []:
        records.append({
            "id": row["id"],
            "file_id": row["file_id"],
            "filename": (row.get("files") or {}).get("filename"),
            "created_at": row["created_at"],
            "extracted": row["extracted_json"],
        })
    return {"records": records}
