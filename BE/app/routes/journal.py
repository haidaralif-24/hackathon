from __future__ import annotations

from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

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
def create_entry(body: JournalEntryIn):
    supabase = get_supabase()
    today_entries = (
        supabase.table("journal_entries")
        .select("id")
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
        return resp.data[0]
    resp = supabase.table("journal_entries").insert({
        "mood": body.mood,
        "content": body.content,
    }).execute()
    return resp.data[0]


@router.get("", response_model=list[JournalEntryOut])
def list_entries(limit: int = 50):
    supabase = get_supabase()
    resp = (
        supabase.table("journal_entries")
        .select("*")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return resp.data or []


@router.delete("/{entry_id}")
def delete_entry(entry_id: str):
    supabase = get_supabase()
    supabase.table("journal_entries").delete().eq("id", entry_id).execute()
    return {"deleted": True}
