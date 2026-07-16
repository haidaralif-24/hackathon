from __future__ import annotations

from fastapi import APIRouter

from app.database import get_supabase

router = APIRouter(prefix="/sync", tags=["sync"])

MOCK_FILES = [
    {"filename": "Lab_Result_CBC_2026-06-15.pdf", "source": "gdrive"},
    {"filename": "Prescription_Amoxicillin_2026-06-10.pdf", "source": "gdrive"},
    {"filename": "Vital_Signs_Checkup_2026-06-08.pdf", "source": "gdrive"},
    {"filename": "Lab_Result_Thyroid_2026-04-28.pdf", "source": "gdrive"},
    {"filename": "Rontgen_Dada_2026-04-15.jpg", "source": "gdrive"},
    {"filename": "Resume_Medis_2026-05-12.pdf", "source": "gdrive"},
]


@router.get("")
def sync_mock():
    db = get_supabase()
    existing = db.table("files").select("filename").execute()
    existing_filenames = {r["filename"] for r in (existing.data or [])}

    inserted = 0
    for f in MOCK_FILES:
        if f["filename"] in existing_filenames:
            continue
        db.table("files").insert(f).execute()
        inserted += 1

    all_files = db.table("files").select("*").order("synced_at", desc=True).execute()
    return {"files": all_files.data or [], "synced": inserted}
