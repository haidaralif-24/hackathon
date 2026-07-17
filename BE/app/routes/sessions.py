from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_user_id
from app.database import get_supabase
from app.schemas import ChatMessageOut, ChatSessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[ChatSessionOut])
def list_sessions(user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    resp = (
        supabase.table("chat_sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return resp.data or []


@router.delete("/{session_id}")
def delete_session(session_id: str, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    owner = supabase.table("chat_sessions").select("user_id").eq("id", session_id).execute().data
    if not owner or owner[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your session")
    supabase.table("chat_sessions").delete().eq("id", session_id).execute()
    return {"deleted": True}


@router.get("/{session_id}/messages", response_model=list[ChatMessageOut])
def get_messages(session_id: str, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    owner = supabase.table("chat_sessions").select("user_id").eq("id", session_id).execute().data
    if not owner or owner[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your session")
    resp = (
        supabase.table("chat_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return resp.data or []
