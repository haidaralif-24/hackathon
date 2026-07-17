from __future__ import annotations

from datetime import date, timedelta

from app.database import get_supabase
from app.llm import chat_completion

REFLECTION_PROMPT = """You are Ben, a personal health reflection assistant.

A user's past week of journal entries and health records is provided below.
Write a warm, insightful weekly reflection in Indonesian. Use "Kamu" to address the user.

Structure your response with these sections:

**Mood Overview** — Summarize their emotional trend over the week. Mention specific moods.

**Health Highlights** — Notable patterns from their health records (lab results, medications, vitals).

**Mind-Body Connection** — Connect their mood patterns with health data (e.g., "Kamu merasa cemas di hari saat tekanan darahmu naik").

**Weekly Tip** — One small actionable suggestion for next week based on their data.

Keep it conversational, supportive, and concise (max 3 paragraphs).
Do NOT use markdown formatting — use plain text with emojis where appropriate.
Sign off as "— Ben" at the end.

Past week: {week_start} to {week_end}

Journal entries:
{journal_summary}

Health records:
{health_summary}
"""


def _get_week_range() -> tuple[date, date]:
    today = date.today()
    week_end = today
    week_start = today - timedelta(days=7)
    return week_start, week_end


def generate_reflection(user_id: str) -> str:
    supabase = get_supabase()
    week_start, week_end = _get_week_range()

    journal_resp = (
        supabase.table("journal_entries")
        .select("mood,content,created_at")
        .eq("user_id", user_id)
        .gte("created_at", week_start.isoformat())
        .lte("created_at", week_end.isoformat())
        .order("created_at", desc=True)
        .execute()
    )
    journals = journal_resp.data or []

    records_resp = (
        supabase.table("records")
        .select("*, files(filename)")
        .gte("created_at", week_start.isoformat())
        .order("created_at", desc=True)
        .execute()
    )
    records = records_resp.data or []

    if not journals and not records:
        return (
            "Belum ada data minggu ini. Ayo catat suasana hati dan jaga kesehatanmu!\n\n"
            "Tips: Coba tulis jurnal harian dan sinkronkan catatan kesehatan lewat Google Drive. "
            "Minggu depan aku bakal siapkan refleksi yang lebih personal untukmu.\n\n— Ben"
        )

    journal_lines = []
    for j in journals[:10]:
        date_str = j["created_at"][:10]
        mood = j["mood"]
        content = j.get("content", "") or ""
        journal_lines.append(f"- {date_str}: mood {mood} — {content[:100]}")

    mood_counts: dict[str, int] = {}
    for j in journals:
        mood_counts[j["mood"]] = mood_counts.get(j["mood"], 0) + 1

    health_lines = []
    for r in records[:5]:
        e = r.get("extracted_json") or {}
        filename = (r.get("files") or {}).get("filename", "Unknown")
        doc_type = e.get("document_type", "unknown")
        meds = e.get("medications", [])
        labs = e.get("lab_values", [])
        notes = e.get("notes", "")
        line = f"- {filename} ({doc_type})"
        if meds:
            line += f" | Meds: {', '.join(m['name'] for m in meds[:3])}"
        if labs:
            abnormal = [l for l in labs if l.get("flag") and l["flag"] != "normal"]
            if abnormal:
                flags = ", ".join(f'{a["name"]}={a["value"]}' for a in abnormal)
                line += f" | Flags: {flags}"
        if notes:
            line += f" | {notes[:80]}"
        health_lines.append(line)

    journal_summary = "\n".join(journal_lines) if journal_lines else "Tidak ada jurnal minggu ini."
    health_summary = "\n".join(health_lines) if health_lines else "Tidak ada data kesehatan baru."

    if mood_counts:
        total = sum(mood_counts.values())
        mood_pct = ", ".join(f"{m}: {int(c/total*100)}%" for m, c in sorted(mood_counts.items()))
        journal_summary += f"\n\nMood distribution: {mood_pct}"

    prompt = REFLECTION_PROMPT.format(
        week_start=week_start.isoformat(),
        week_end=week_end.isoformat(),
        journal_summary=journal_summary,
        health_summary=health_summary,
    )

    raw = chat_completion(system=prompt, user="Buatkan refleksi mingguan untukku.", json_mode=False)
    return raw.strip() or "Refleksi belum tersedia. Coba lagi nanti, ya!"


def store_reflection(user_id: str, content: str) -> None:
    supabase = get_supabase()
    week_start, week_end = _get_week_range()
    supabase.table("reflections").insert({
        "user_id": user_id,
        "week_start": week_start.isoformat(),
        "week_end": week_end.isoformat(),
        "content": content,
    }).execute()


def get_latest_reflection(user_id: str) -> dict | None:
    supabase = get_supabase()
    resp = (
        supabase.table("reflections")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return resp.data[0] if resp.data else None


def should_refresh(user_id: str) -> bool:
    supabase = get_supabase()
    today = date.today()
    resp = (
        supabase.table("reflections")
        .select("id")
        .eq("user_id", user_id)
        .gte("created_at", today.isoformat())
        .execute()
    )
    return len(resp.data or []) == 0
