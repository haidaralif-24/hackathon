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

TRIAGE_SYSTEM_PROMPT = """You are Ben, a health literacy assistant. Respond to health-related questions.

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
- Do NOT fabricate medical facts, drug names, dosages, or conditions. If unsure, state the limitation.
- Do NOT invent citations, URLs, or references. Only cite sources listed in the Trusted Sources section by name.
- If you do not know the answer or lack sufficient information, say so directly — do not make one up. Suggest the user consult a healthcare provider or check reliable sources.
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


def build_health_context(supabase) -> str:
    try:
        resp = supabase.table("records").select("extracted_json").order("created_at", desc=True).limit(10).execute()
        records = resp.data or []
        if not records:
            return ""

        medications: list[str] = []
        conditions: list[str] = []
        lab_flags: list[str] = []

        for r in records:
            data = r.get("extracted_json") or {}
            for med in data.get("medications", []):
                med_str = f"{med.get('name','')} {med.get('dosage','')} {med.get('frequency','')}".strip()
                if med_str and med_str not in medications:
                    medications.append(med_str)
            for lab in data.get("lab_values", []):
                if lab.get("flag") and lab.get("flag") != "normal":
                    lab_flags.append(f"{lab.get('name','')}: {lab.get('value','')}{lab.get('unit','')} ({lab.get('flag')})")
            if data.get("notes") and data["notes"] not in conditions:
                conditions.append(data["notes"])

        parts: list[str] = []
        if medications:
            parts.append("Medications: " + ", ".join(medications))
        if conditions:
            parts.append("Conditions/Notes: " + ", ".join(conditions))
        if lab_flags:
            parts.append("Lab Results: " + ", ".join(lab_flags))

        if not parts:
            return ""

        return "\n\nUser Health Record Summary (from uploaded documents):\n" + "\n".join(parts) + "\n\nUse this context to personalize your response. Do NOT fabricate additional medical history."
    except Exception:
        return ""


def run_triage(
    message: str,
    history: list[dict] | None = None,
    persona: str = "straightforward",
    health_context: str = "",
) -> AnswerTurn | QuestionTurn | ResultTurn:
    tone = PERSONA_MAP.get(persona, persona)
    system_prompt = TRIAGE_SYSTEM_PROMPT.replace("{persona}", tone) + "\n\n" + SOURCES
    if health_context:
        system_prompt += "\n\n" + health_context
    raw = chat_completion(
        system=system_prompt,
        user=message,
        history=history or [],
        json_mode=True,
    )
    if not raw:
        raise ValueError("LLM returned empty response")
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"LLM returned invalid JSON: {raw[:200]}")
    return parse_turn(data)
