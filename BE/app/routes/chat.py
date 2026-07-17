from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.database import get_supabase
from app.schemas import ChatRequest, ChatResponse
from app.services.triage import build_health_context, run_triage

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    if not settings.llm_api_key:
        raise HTTPException(status_code=500, detail="LLM_API_KEY not configured on server")
    if not settings.llm_base_url:
        raise HTTPException(status_code=500, detail="LLM_BASE_URL not configured on server")

    supabase = get_supabase()
    session_id = req.session_id

    if not session_id:
        resp = supabase.table("chat_sessions").insert({"title": "New Chat"}).execute()
        session_id = resp.data[0]["id"]

    supabase.table("chat_messages").insert({
        "session_id": session_id,
        "role": "user",
        "content": req.message,
    }).execute()

    message_count = (
        supabase.table("chat_messages")
        .select("id", count="exact")
        .eq("session_id", session_id)
        .execute()
        .count or 0
    )

    health_context = ""
    if message_count <= 2:
        health_context = build_health_context(supabase)

    try:
        turn = run_triage(
            message=req.message,
            history=req.history,
            persona=req.persona,
            health_context=health_context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")

    content = (
        turn.text if hasattr(turn, "text")
        else turn.explanation if hasattr(turn, "explanation")
        else ""
    )

    supabase.table("chat_messages").insert({
        "session_id": session_id,
        "role": "assistant",
        "content": content,
    }).execute()

    supabase.table("chat_sessions").update({"title": req.message[:50]}).eq("id", session_id).eq("title", "New Chat").execute()

    supabase.table("chat_sessions").update({"updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", session_id).execute()

    return ChatResponse(session_id=session_id, turn=turn)
