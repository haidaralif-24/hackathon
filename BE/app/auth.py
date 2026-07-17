from __future__ import annotations

from fastapi import Depends, HTTPException, Header
from supabase import Client

from app.database import get_supabase


def get_user_id(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization[7:]
    supabase: Client = get_supabase()
    try:
        resp = supabase.auth.get_user(token)
        user_id = resp.user.id
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
