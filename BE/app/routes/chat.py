from __future__ import annotations

from typing import Union

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import AnswerTurn, ChatRequest, QuestionTurn, ResultTurn
from app.services.triage import run_triage

router = APIRouter(prefix="/chat", tags=["chat"])

ChatTurn = Union[AnswerTurn, QuestionTurn, ResultTurn]


@router.post("", response_model=ChatTurn)
def chat(req: ChatRequest) -> ChatTurn:
    if not settings.llm_api_key:
        raise HTTPException(status_code=500, detail="LLM_API_KEY not configured on server")
    if not settings.llm_base_url:
        raise HTTPException(status_code=500, detail="LLM_BASE_URL not configured on server")
    try:
        return run_triage(
            message=req.message,
            history=req.history,
            persona=req.persona,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")
