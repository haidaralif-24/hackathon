from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.database import get_supabase
from app.schemas import ChatMessageOut, ChatSessionCreate, ChatSessionOut, ChatSessionUpdate

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[ChatSessionOut])
def list_sessions():
    supabase = get_supabase()
    resp = supabase.table("chat_sessions").select("*").order("updated_at", desc=True).execute()
    return resp.data or []


@router.post("", response_model=ChatSessionOut)
def create_session(body: ChatSessionCreate = ChatSessionCreate()):
    supabase = get_supabase()
    resp = supabase.table("chat_sessions").insert({"title": body.title}).execute()
    return resp.data[0]


@router.delete("/{session_id}")
def delete_session(session_id: str):
    supabase = get_supabase()
    supabase.table("chat_sessions").delete().eq("id", session_id).execute()
    return {"deleted": True}


@router.put("/{session_id}", response_model=ChatSessionOut)
def update_session(session_id: str, body: ChatSessionUpdate):
    supabase = get_supabase()
    resp = (
        supabase.table("chat_sessions")
        .update({"title": body.title, "updated_at": "now()"})
        .eq("id", session_id)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return resp.data[0]


@router.get("/{session_id}/messages", response_model=list[ChatMessageOut])
def get_messages(session_id: str):
    supabase = get_supabase()
    resp = (
        supabase.table("chat_messages")
        .select("*")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )
    return resp.data or []
