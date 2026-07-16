from __future__ import annotations

import base64
from typing import Optional

from openai import OpenAI

from app.config import settings
from app.schemas import ExtractedRecord

client = OpenAI(
    base_url=settings.nvidia_nim_base_url,
    api_key=settings.nvidia_nim_api_key,
)


def ocr_image(image_bytes: bytes) -> str:
    b64 = base64.b64encode(image_bytes).decode()
    data_uri = f"data:image/png;base64,{b64}"

    resp = client.chat.completions.create(
        model="nvidia/nemotron-ocr-v2",
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
    resp = client.chat.completions.create(
        model="meta/llama-4-maverick",
        messages=[
            {"role": "system", "content": EXTRACTION_PROMPT},
            {"role": "user", "content": ocr_text},
        ],
        response_format={"type": "json_object"},
    )
    raw = resp.choices[0].message.content or "{}"
    return ExtractedRecord.model_validate_json(raw)


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

    kwargs = {"model": "meta/llama-4-maverick", "messages": messages}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    resp = client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content or ""
