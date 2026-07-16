from __future__ import annotations

from app.database import get_supabase
from app.llm import ocr_image, structure_ocr
from app.schemas import ExtractedRecord


def process_file(file_id: str, image_bytes: bytes) -> ExtractedRecord:
    raw_text = ocr_image(image_bytes)
    record = structure_ocr(raw_text)
    db = get_supabase()
    db.table("records").insert({
        "file_id": file_id,
        "extracted_json": record.model_dump(mode="json"),
    }).execute()
    db.table("files").update({"processed": True}).eq("id", file_id).execute()
    return record
