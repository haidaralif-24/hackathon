from __future__ import annotations

import base64
from typing import Optional

from openai import OpenAI

from app.config import settings
from app.schemas import ExtractedRecord


def _get_client() -> OpenAI:
    return OpenAI(
        base_url=settings.llm_base_url,
        api_key=settings.llm_api_key,
    )


def ocr_image(image_bytes: bytes) -> str:
    b64 = base64.b64encode(image_bytes).decode()
    data_uri = f"data:image/png;base64,{b64}"

    resp = _get_client().chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract all visible text from this image exactly as written."},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            }
        ],
    )
    return resp.choices[0].message.content or ""


EXTRACTION_PROMPT = """You extract structured health data from OCR text.
Output ONLY valid JSON matching this schema, NO prose, NO markdown:
{
  "document_type": "prescription" | "lab_result" | "note" | "other",
  "date": "YYYY-MM-DD" | null,
  "medications": [{"name": str, "dosage": str, "frequency": str}],
  "lab_values": [{"name": str, "value": str, "unit": str, "flag": "normal" | "high" | "low" | null}],
  "provider": str | null,
  "notes": str | null
}"""


def structure_ocr(ocr_text: str) -> ExtractedRecord:
    resp = _get_client().chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": EXTRACTION_PROMPT},
            {"role": "user", "content": ocr_text},
        ],
        response_format={"type": "json_object"},
    )
    raw = resp.choices[0].message.content or "{}"
    return ExtractedRecord.model_validate_json(raw)


VLM_SYSTEM = (
    "You are a health literacy assistant. "
    "Describe visible characteristics of the image in plain language — "
    "color, size, shape, texture, location on body (if identifiable). "
    "Do not diagnose. Do not suggest treatments. "
    'End with: "This description is not a medical diagnosis. Consult a healthcare provider."'
)


def analyze_image(image_bytes: bytes, prompt: str = "Describe what you see in this image.") -> str:
    b64 = base64.b64encode(image_bytes).decode()
    data_uri = f"data:image/png;base64,{b64}"

    resp = _get_client().chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": VLM_SYSTEM},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_uri}},
                ],
            },
        ],
    )
    return resp.choices[0].message.content or ""


def chat_completion(
    system: str,
    user: str,
    history: Optional[list[dict]] = None,
    json_mode: bool = False,
) -> str:
    messages = [{"role": "system", "content": system}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": user})

    kwargs = {"model": "deepseek-chat", "messages": messages}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    resp = _get_client().chat.completions.create(**kwargs)
    return resp.choices[0].message.content or ""
