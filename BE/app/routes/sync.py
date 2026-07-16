from __future__ import annotations

from fastapi import APIRouter

from app.database import supabase
from app.schemas import SyncFile

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("")
def sync_files(files: list[SyncFile]):
    existing = supabase.table("files").select("filename").execute()
    existing_filenames = {r["filename"] for r in (existing.data or [])}

    new_files = []
    for f in files:
        if f.filename in existing_filenames:
            continue
        result = supabase.table("files").insert({
            "filename": f.filename,
            "source": f.source,
        }).execute()
        new_files.append(result.data[0] if result.data else None)

    all_files = supabase.table("files").select("*").order("synced_at", desc=True).execute()
    return {"files": all_files.data or []}
