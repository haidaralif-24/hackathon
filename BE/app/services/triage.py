from __future__ import annotations

import json

from app.llm import chat_completion
from app.schemas import AnswerTurn, QuestionTurn, ResultTurn, Urgency

PERSONA_MAP = {
    "straightforward": "Respond in a direct, clinical tone — concise, factual, minimal warmth.",
    "friendly": "Respond in a warm, approachable tone — empathetic and encouraging.",
    "detailed": "Respond in a thorough, educational tone — explain reasoning and provide context.",
}

SOURCES = """Trusted sources (reference these by name in explanations):
- WHO: World Health Organization — global health guidelines
- CDC: Centers for Disease Control and Prevention — disease info
- Mayo Clinic: patient education resource
- NHS: UK National Health Service — symptom checker standards
- Kemenkes: Indonesian Ministry of Health — local health guidelines
- IDI: Ikatan Dokter Indonesia — Indonesian medical association

When providing a "result", cite the relevant source in the explanation like "per WHO guidelines" or "(source: CDC)". Do NOT fabricate URLs."""

TRIAGE_SYSTEM_PROMPT = """You are a health literacy assistant. Respond to health-related questions.

You must output ONLY valid JSON. No prose, no markdown.

The "type" field determines your response:

1. "answer" — Give a direct, educational answer. Use this when the user asks a general question or doesn't need triage.
   {{"type": "answer", "text": "your response here"}}

2. "question" — Ask a follow-up question with multiple choice options. Use this when you need more info before giving triage.
   {{"type": "question", "text": "your question", "options": ["option1", "option2", "option3"]}}

3. "result" — Provide a triage assessment. Use this when you have enough information.
   {{"type": "result", "urgency": "emergency" | "monitor" | "24h", "explanation": "detailed explanation (cite sources like 'per WHO guidelines')", "specialist": "specialty or null"}}

Urgency levels:
- "emergency": Life-threatening or potentially life-threatening. Immediate medical attention needed.
- "24h": Requires medical attention within 24 hours. Urgent but not immediately life-threatening.
- "monitor": Can be monitored at home. Seek care if symptoms worsen.

Guidelines:
- When a user describes symptoms, evaluate if you need more information. If yes, ask ONE question at a time using "question" type with multiple choice options.
- Once you have enough information, provide a "result" with appropriate urgency.
- Use over-escalation bias: when in doubt, err on the side of higher urgency.
- If the user asks a general health question (e.g., "what is hypertension", "how does insulin work"), respond with "answer".
- Keep responses concise, clear, and educational.
- Do NOT diagnose specific conditions.
- Persona: {persona}"""


def parse_turn(data: dict) -> AnswerTurn | QuestionTurn | ResultTurn:
    t = data.get("type")
    if t == "answer":
        return AnswerTurn.model_validate(data)
    elif t == "question":
        return QuestionTurn.model_validate(data)
    elif t == "result":
        return ResultTurn.model_validate(data)
    raise ValueError(f"Unknown turn type: {t}")


def run_triage(
    message: str,
    history: list[dict] | None = None,
    persona: str = "straightforward",
) -> AnswerTurn | QuestionTurn | ResultTurn:
    tone = PERSONA_MAP.get(persona, persona)
    system_prompt = TRIAGE_SYSTEM_PROMPT.replace("{persona}", tone) + "\n\n" + SOURCES
    raw = chat_completion(
        system=system_prompt,
        user=message,
        history=history or [],
        json_mode=True,
    )
    data = json.loads(raw)
    return parse_turn(data)
