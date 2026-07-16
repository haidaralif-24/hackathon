from __future__ import annotations

from typing import Optional

from supabase import Client, create_client

from app.config import settings

_supabase_instance: Optional[Client] = None


def get_supabase() -> Client:
    global _supabase_instance
    if _supabase_instance is None:
        _supabase_instance = create_client(
            supabase_url=settings.supabase_url,
            supabase_key=settings.supabase_key,
        )
    return _supabase_instance
