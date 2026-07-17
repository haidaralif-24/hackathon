from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.auth import get_user_id
from app.database import get_supabase

router = APIRouter(prefix="/journal", tags=["journal"])


class JournalEntryIn(BaseModel):
    mood: str
    content: str = ""


class JournalEntryOut(BaseModel):
    id: str
    mood: str
    content: str
    created_at: str


@router.post("", response_model=JournalEntryOut)
def create_entry(body: JournalEntryIn, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    today_entries = (
        supabase.table("journal_entries")
        .select("id")
        .eq("user_id", user_id)
        .gte("created_at", date.today().isoformat())
        .execute()
        .data
    )
    if today_entries:
        resp = (
            supabase.table("journal_entries")
            .update({"mood": body.mood, "content": body.content})
            .eq("id", today_entries[0]["id"])
            .execute()
        )
        if not resp.data:
            raise HTTPException(status_code=500, detail="Failed to update journal entry")
        return resp.data[0]
    resp = supabase.table("journal_entries").insert({
        "mood": body.mood,
        "content": body.content,
        "user_id": user_id,
    }).execute()
    if not resp.data:
        raise HTTPException(status_code=500, detail="Failed to create journal entry")
    return resp.data[0]


@router.get("", response_model=list[JournalEntryOut])
def list_entries(
    user_id: str = Depends(get_user_id),
    limit: int = Query(50),
):
    supabase = get_supabase()
    resp = (
        supabase.table("journal_entries")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return resp.data or []


@router.delete("/{entry_id}")
def delete_entry(entry_id: str, user_id: str = Depends(get_user_id)):
    supabase = get_supabase()
    entry = supabase.table("journal_entries").select("user_id").eq("id", entry_id).execute().data
    if not entry or entry[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not your entry")
    supabase.table("journal_entries").delete().eq("id", entry_id).execute()
    return {"deleted": True}
