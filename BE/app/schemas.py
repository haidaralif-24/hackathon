from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


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


class ChatMode(str, Enum):
    general = "general"
    symptom_check = "symptom_check"


class ChatRequest(BaseModel):
    message: str
    mode: ChatMode = ChatMode.general
    history: list[dict] = []
    persona: str = "straightforward"


class QuestionTurn(BaseModel):
    type: str = "question"
    text: str
    options: list[str]


class ResultTurn(BaseModel):
    type: str = "result"
    urgency: Urgency
    explanation: str
