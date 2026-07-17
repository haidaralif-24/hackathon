from __future__ import annotations

from fastapi import APIRouter

from app.database import get_supabase
from app.schemas import SyncFile

router = APIRouter(prefix="/sync", tags=["sync"])

MOCK_RECORDS = [
    {
        "filename": "Lab_Darah_Flulike_2026-06-15.pdf",
        "created_at": "2026-06-15T09:30:00+07:00",
        "extracted": {
            "document_type": "lab_result",
            "date": "2026-06-15",
            "lab_values": [
                {"name": "Hemoglobin", "value": "14.1", "unit": "g/dL", "flag": "normal"},
                {"name": "Leukosit", "value": "11.200", "unit": "/uL", "flag": "high"},
                {"name": "Limfosit", "value": "45", "unit": "%", "flag": "high"},
                {"name": "CRP", "value": "8", "unit": "mg/L", "flag": "high"},
                {"name": "Neutrofil", "value": "48", "unit": "%", "flag": "normal"},
            ],
            "provider": "dr. Sarah Wijaya, Sp.PK",
            "notes": "Peningkatan leukosit dan limfosit konsisten dengan infeksi virus (flu-like illness). CRP ringan meningkat mengindikasikan peradangan ringan.",
        },
    },
    {
        "filename": "Resep_Obat_Flu_2026-06-10.pdf",
        "created_at": "2026-06-10T14:15:00+07:00",
        "extracted": {
            "document_type": "prescription",
            "date": "2026-06-10",
            "medications": [
                {"name": "Paracetamol", "dosage": "500 mg", "frequency": "3x daily jika demam"},
                {"name": "Cetirizine", "dosage": "10 mg", "frequency": "1x daily"},
                {"name": "Vitamin C", "dosage": "500 mg", "frequency": "1x daily"},
            ],
            "provider": "dr. Andi Pratama, Sp.PD",
        },
    },
    {
        "filename": "Cek_Kesehatan_Rutin_2026-06-08.pdf",
        "created_at": "2026-06-08T10:00:00+07:00",
        "extracted": {
            "document_type": "note",
            "date": "2026-06-08",
            "lab_values": [
                {"name": "Tekanan Darah", "value": "112/74", "unit": "mmHg", "flag": "normal"},
                {"name": "Nadi", "value": "76", "unit": "bpm", "flag": "normal"},
                {"name": "Suhu", "value": "36.7", "unit": "°C", "flag": "normal"},
                {"name": "SpO2", "value": "99", "unit": "%", "flag": "normal"},
                {"name": "BMI", "value": "21.8", "unit": "kg/m\u00b2", "flag": "normal"},
            ],
            "provider": "dr. Maya Kusuma, Sp.KKLP",
            "notes": "Pemeriksaan rutin — semua vital dalam batas normal. Pasien dalam kondisi sehat.",
        },
    },
    {
        "filename": "Tes_Alergi_Musiman_2026-05-28.pdf",
        "created_at": "2026-05-28T08:45:00+07:00",
        "extracted": {
            "document_type": "lab_result",
            "date": "2026-05-28",
            "lab_values": [
                {"name": "IgE Total", "value": "85", "unit": "IU/mL", "flag": "normal"},
                {"name": "Pollen Rumput", "value": "0.3", "unit": "kU/L", "flag": "normal"},
                {"name": "Debu Rumah", "value": "0.5", "unit": "kU/L", "flag": "normal"},
                {"name": "Bulu Kucing", "value": "8.2", "unit": "kU/L", "flag": "high"},
            ],
            "provider": "dr. Rina Putri, Sp.PK",
            "notes": "Tes alergi menunjukkan sensitivitas ringan terhadap bulu kucing. Tidak ada alergi signifikan terhadap pollen atau debu rumah.",
        },
    },
    {
        "filename": "Rontgen_Thorax_2026-05-20.pdf",
        "created_at": "2026-05-20T11:30:00+07:00",
        "extracted": {
            "document_type": "note",
            "date": "2026-05-20",
            "provider": "dr. Budi Santoso, Sp.Rad",
            "notes": "Foto thorax dalam batas normal. Tidak tampak kelainan pada paru, jantung, dan mediastinum. Kesimpulan: Sehat.",
        },
    },
    {
        "filename": "Catatan_Klinik_2026-05-12.pdf",
        "created_at": "2026-05-12T16:00:00+07:00",
        "extracted": {
            "document_type": "note",
            "date": "2026-05-12",
            "lab_values": [
                {"name": "CRP", "value": "6", "unit": "mg/L", "flag": "mild"},
            ],
            "provider": "dr. Andi Pratama, Sp.PD",
            "notes": "Diagnosis: Common cold (flu-like illness). Keluhan: pilek, bersin-bersin, nyeri tenggorokan ringan, lemas. Tidak ada demam tinggi. Tidak ada komorbid. Pasien diberikan resep obat flu dan dianjurkan istirahat serta minum air putih yang cukup. Prognosis: baik, sembuh dalam 5-7 hari.",
        },
    },
]


@router.get("")
def sync_mock():
    db = get_supabase()
    existing_files = {r["filename"] for r in (db.table("files").select("filename").execute().data or [])}

    inserted = 0
    for rec in MOCK_RECORDS:
        if rec["filename"] in existing_files:
            continue
        file_resp = db.table("files").insert({
            "filename": rec["filename"],
            "source": "gdrive",
            "synced_at": rec["created_at"],
        }).execute()
        file_id = file_resp.data[0]["id"]

        db.table("records").insert({
            "file_id": file_id,
            "extracted_json": rec["extracted"],
            "created_at": rec["created_at"],
        }).execute()
        inserted += 1

    all_records = (
        db.table("records")
        .select("*, files(filename)")
        .order("created_at", desc=True)
        .execute()
    )
    formatted = [
        {
            "id": r["id"],
            "file_id": r["file_id"],
            "filename": (r.get("files") or {}).get("filename"),
            "created_at": r["created_at"],
            "extracted": r["extracted_json"],
        }
        for r in (all_records.data or [])
    ]
    return {"files": formatted, "synced": inserted}


@router.post("")
def sync_files(files: list[SyncFile]):
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
