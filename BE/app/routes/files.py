from __future__ import annotations

from fastapi import APIRouter, UploadFile

from app.services.extraction import process_file

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/{file_id}/process")
async def process_upload(file_id: str, file: UploadFile):
    image_bytes = await file.read()
    record = process_file(file_id, image_bytes)
    return {"file_id": file_id, "record": record.model_dump(mode="json")}
