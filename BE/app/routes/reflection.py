from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import ReflectionOut
from app.services.reflection import (
    generate_reflection,
    get_latest_reflection,
    should_refresh,
    store_reflection,
)

router = APIRouter(prefix="/reflect", tags=["reflect"])


@router.post("", response_model=ReflectionOut)
def reflect(user_id: str):
    if not settings.llm_api_key:
        raise HTTPException(status_code=500, detail="LLM_API_KEY not configured")

    if not should_refresh(user_id):
        latest = get_latest_reflection(user_id)
        if latest:
            return latest

    try:
        content = generate_reflection(user_id)
        store_reflection(user_id, content)
        latest = get_latest_reflection(user_id)
        if latest:
            return latest
        raise HTTPException(status_code=500, detail="Failed to store reflection")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reflection error: {e}")


@router.get("", response_model=ReflectionOut | dict)
def get_reflection(user_id: str):
    latest = get_latest_reflection(user_id)
    if not latest:
        return {"reflection": None, "message": "Belum ada refleksi. Coba generate dulu!"}
    return latest
