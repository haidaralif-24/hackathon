from __future__ import annotations

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel


class Urgency(str, Enum):
    emergency = "emergency"
    monitor = "monitor"
    need_care_24h = "24h"


class DocumentType(str, Enum):
    prescription = "prescription"
    lab_result = "lab_result"
    note = "note"
    other = "other"


class Medication(BaseModel):
    name: str
    dosage: str
    frequency: str


class LabValue(BaseModel):
    name: str
    value: str
    unit: str
    flag: Optional[str] = None


class ExtractedRecord(BaseModel):
    document_type: DocumentType
    date: Optional[str] = None
    medications: list[Medication] = []
    lab_values: list[LabValue] = []
    provider: Optional[str] = None
    notes: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    persona: str = "straightforward"
    session_id: Optional[str] = None


class ChatSessionOut(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


class ChatSessionCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ChatSessionUpdate(BaseModel):
    title: str


class ChatMessageOut(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    created_at: str


class SyncFile(BaseModel):
    filename: str
    source: str = "upload"


class AnswerTurn(BaseModel):
    type: Literal["answer"] = "answer"
    text: str


class QuestionTurn(BaseModel):
    type: Literal["question"] = "question"
    text: str
    options: list[str]


class ResultTurn(BaseModel):
    type: Literal["result"] = "result"
    urgency: Urgency
    explanation: str
    specialist: Optional[str] = None
