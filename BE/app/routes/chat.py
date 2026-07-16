from __future__ import annotations

from typing import Union

from fastapi import APIRouter

from app.schemas import AnswerTurn, ChatRequest, QuestionTurn, ResultTurn
from app.services.triage import run_triage

router = APIRouter(prefix="/chat", tags=["chat"])

ChatTurn = Union[AnswerTurn, QuestionTurn, ResultTurn]


@router.post("", response_model=ChatTurn)
def chat(req: ChatRequest) -> ChatTurn:
    return run_triage(
        message=req.message,
        history=req.history,
        persona=req.persona,
    )
