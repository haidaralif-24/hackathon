from __future__ import annotations

from fastapi import APIRouter, Query

from app.services.facilities import search_places

router = APIRouter(prefix="/facilities", tags=["facilities"])


@router.get("")
def list_facilities(
    urgency: str = Query("monitor", description="urgency level from triage result"),
    specialist: str | None = Query(None, description="specialist type from triage result"),
    lat: float | None = Query(None, description="latitude for Places API search"),
    lng: float | None = Query(None, description="longitude for Places API search"),
):
    facilities = search_places(urgency, specialist, lat, lng)
    return {"facilities": facilities}
