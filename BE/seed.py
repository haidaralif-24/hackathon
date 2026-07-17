"""Run once to seed mock health records into Supabase."""

from app.database import get_supabase

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
            "notes": "Peningkatan leukosit dan limfosit konsisten dengan infeksi virus (flu-like illness). CRP ringan meningkat.",
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
                {"name": "BMI", "value": "21.8", "unit": "kg/m²", "flag": "normal"},
            ],
            "provider": "dr. Maya Kusuma, Sp.KKLP",
            "notes": "Pemeriksaan rutin — semua vital dalam batas normal.",
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
            "notes": "Sensitivitas ringan terhadap bulu kucing. Tidak ada alergi signifikan lainnya.",
        },
    },
    {
        "filename": "Rontgen_Thorax_2026-05-20.pdf",
        "created_at": "2026-05-20T11:30:00+07:00",
        "extracted": {
            "document_type": "note",
            "date": "2026-05-20",
            "provider": "dr. Budi Santoso, Sp.Rad",
            "notes": "Foto thorax dalam batas normal. Tidak tampak kelainan. Kesimpulan: Sehat.",
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
            "notes": "Diagnosis: Common cold (flu-like illness). Keluhan: pilek, bersin, nyeri tenggorokan ringan, lemas. Tidak ada demam tinggi. Prognosis baik, sembuh dalam 5-7 hari.",
        },
    },
]


def seed():
    db = get_supabase()
    existing = {r["filename"] for r in (db.table("files").select("filename").execute().data or [])}

    count = 0
    for rec in MOCK_RECORDS:
        if rec["filename"] in existing:
            print(f"  Skipping {rec['filename']} (already exists)")
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
        count += 1
        print(f"  Seeded {rec['filename']}")

    print(f"\nDone. {count} records seeded.")


if __name__ == "__main__":
    seed()
