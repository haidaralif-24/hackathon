from __future__ import annotations

from fastapi import APIRouter

from app.database import get_supabase

router = APIRouter(prefix="/sync", tags=["sync"])

MOCK_RECORDS = [
    {
        "filename": "Lab_Result_CBC_2026-06-15.pdf",
        "extracted": {
            "document_type": "lab_result",
            "date": "2026-06-15",
            "lab_values": [
                {"name": "Hemoglobin", "value": "13.2", "unit": "g/dL", "flag": "normal"},
                {"name": "Leukosit", "value": "8.500", "unit": "/uL", "flag": "normal"},
                {"name": "Trombosit", "value": "245.000", "unit": "/uL", "flag": "normal"},
                {"name": "Hematokrit", "value": "42", "unit": "%", "flag": "normal"},
                {"name": "MCV", "value": "87", "unit": "fL", "flag": "normal"},
            ],
            "provider": "dr. Sarah Wijaya, Sp.PK",
        },
    },
    {
        "filename": "Prescription_Amoxicillin_2026-06-10.pdf",
        "extracted": {
            "document_type": "prescription",
            "date": "2026-06-10",
            "medications": [
                {"name": "Amoxicillin", "dosage": "500 mg", "frequency": "3x daily"},
                {"name": "Paracetamol", "dosage": "500 mg", "frequency": "as needed"},
                {"name": "Vitamin C", "dosage": "250 mg", "frequency": "1x daily"},
            ],
            "provider": "dr. Andi Pratama, Sp.PD",
        },
    },
    {
        "filename": "Vital_Signs_Checkup_2026-06-08.pdf",
        "extracted": {
            "document_type": "note",
            "date": "2026-06-08",
            "lab_values": [
                {"name": "Blood Pressure", "value": "118", "unit": "mmHg", "flag": "normal"},
                {"name": "Heart Rate", "value": "72", "unit": "bpm", "flag": "normal"},
                {"name": "Temperature", "value": "36.6", "unit": "°C", "flag": "normal"},
                {"name": "SpO2", "value": "98", "unit": "%", "flag": "normal"},
                {"name": "BMI", "value": "22.4", "unit": "kg/m²", "flag": "normal"},
            ],
            "provider": "dr. Maya Kusuma, Sp.KKLP",
            "notes": "Routine checkup — all vitals within normal range.",
        },
    },
    {
        "filename": "Lab_Result_Thyroid_2026-04-28.pdf",
        "extracted": {
            "document_type": "lab_result",
            "date": "2026-04-28",
            "lab_values": [
                {"name": "TSH", "value": "2.8", "unit": "mIU/L", "flag": "normal"},
                {"name": "T3 Total", "value": "1.6", "unit": "nmol/L", "flag": "normal"},
                {"name": "Free T4", "value": "15.2", "unit": "pmol/L", "flag": "normal"},
                {"name": "Anti-TPO", "value": "12", "unit": "IU/mL", "flag": "normal"},
            ],
            "provider": "dr. Rina Putri, Sp.PK",
        },
    },
    {
        "filename": "Rontgen_Dada_2026-04-15.jpg",
        "extracted": {
            "document_type": "note",
            "date": "2026-04-15",
            "provider": "dr. Budi Santoso, Sp.Rad (K)",
            "notes": "Foto thorax dalam batas normal. Tidak tampak kelainan aktif pada paru, jantung, dan mediastinum.",
        },
    },
    {
        "filename": "Resume_Medis_2026-05-12.pdf",
        "extracted": {
            "document_type": "note",
            "date": "2026-05-12",
            "medications": [
                {"name": "Amlodipin", "dosage": "5 mg", "frequency": "1x daily"},
                {"name": "Amoxicillin", "dosage": "500 mg", "frequency": "3x daily (7 days)"},
            ],
            "lab_values": [
                {"name": "CRP", "value": "12", "unit": "mg/L", "flag": "high"},
                {"name": "LED", "value": "18", "unit": "mm/jam", "flag": "high"},
            ],
            "provider": "dr. Andi Pratama, Sp.PD",
            "notes": "Diagnosis: Faringitis akut (J02.9). Demam sejak 3 hari, nyeri tenggorokan, batuk kering. Riwayat hipertensi terkontrol, asma ringan (jarang kambuh). CRP dan LED meningkat mengindikasikan infeksi bakteri.",
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
        }).execute()
        file_id = file_resp.data[0]["id"]

        db.table("records").insert({
            "file_id": file_id,
            "extracted_json": rec["extracted"],
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
