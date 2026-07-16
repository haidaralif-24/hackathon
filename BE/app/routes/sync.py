from __future__ import annotations

import httpx
from fastapi import APIRouter, Header, Query

from app.database import get_supabase
from app.schemas import SyncFile

router = APIRouter(prefix="/sync", tags=["sync"])

MOCK_FILES = [
    {"filename": "Lab_Result_CBC_2026-05-12.pdf", "source": "gdrive"},
    {"filename": "Prescription_Amoxicillin_2026-05-10.pdf", "source": "gdrive"},
    {"filename": "Vital_Signs_Checkup_2026-05-08.pdf", "source": "gdrive"},
    {"filename": "Lab_Result_Thyroid_2026-04-28.pdf", "source": "gdrive"},
    {"filename": "Rontgen_Dada_2026-04-15.jpg", "source": "gdrive"},
    {"filename": "Resume_Medis_RS_Siloam.pdf", "source": "gdrive"},
]


def _insert_files(db, file_list: list[dict], source: str):
    existing = db.table("files").select("filename").execute()
    existing_filenames = {r["filename"] for r in (existing.data or [])}

    inserted = 0
    for f in file_list:
        if f["filename"] in existing_filenames:
            continue
        db.table("files").insert({
            "filename": f["filename"],
            "source": source,
        }).execute()
        inserted += 1
    return inserted


@router.get("")
def sync_files(
    authorization: str = Header(None),
    folder_id: str = Query(None, description="Google Drive folder ID to list files from"),
):
    db = get_supabase()

    if authorization and authorization.startswith("Bearer ") and folder_id:
        token = authorization[7:]
        try:
            headers = {"Authorization": f"Bearer {token}"}
            params = {
                "q": f"'{folder_id}' in parents and (mimeType contains 'pdf' or mimeType contains 'image')",
                "fields": "files(id,name,mimeType,modifiedTime)",
            }
            resp = httpx.get(
                "https://www.googleapis.com/drive/v3/files",
                params=params,
                headers=headers,
                timeout=10,
            )
            if resp.status_code == 200:
                drive_files = resp.json().get("files", [])
                file_list = [{"filename": f["name"]} for f in drive_files if "name" in f]
                if file_list:
                    inserted = _insert_files(db, file_list, "gdrive_real")
                    all_files = db.table("files").select("*").order("synced_at", desc=True).execute()
                    return {"files": all_files.data or [], "synced": inserted}
        except Exception:
            pass

    inserted = _insert_files(db, MOCK_FILES, "gdrive")
    all_files = db.table("files").select("*").order("synced_at", desc=True).execute()
    return {"files": all_files.data or [], "synced": inserted}


@router.post("")
def sync_files_body(files: list[SyncFile]):
    db = get_supabase()
    existing = db.table("files").select("filename").execute()
    existing_filenames = {r["filename"] for r in (existing.data or [])}

    new_files = []
    for f in files:
        if f.filename in existing_filenames:
            continue
        result = db.table("files").insert({
            "filename": f.filename,
            "source": f.source,
        }).execute()
        new_files.append(result.data[0] if result.data else None)

    all_files = db.table("files").select("*").order("synced_at", desc=True).execute()
    return {"files": all_files.data or []}
