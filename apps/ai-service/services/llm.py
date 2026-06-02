import json
import os
from typing import Any

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


async def get_llm_response(prompt: str, json_mode: bool = False) -> Any:
    if OPENAI_API_KEY:
        return await _openai(prompt, json_mode)
    if GEMINI_API_KEY:
        return await _gemini(prompt, json_mode)
    raise RuntimeError("No AI API key configured")


async def get_llm_chat(
    messages: list[dict[str, str]],
    json_mode: bool = False,
    system_prompt: str | None = None,
) -> Any:
    if OPENAI_API_KEY:
        return await _openai_chat(messages, json_mode, system_prompt)
    if GEMINI_API_KEY:
        return await _gemini_chat(messages, json_mode, system_prompt)
    raise RuntimeError("No AI API key configured")


async def _openai(prompt: str, json_mode: bool) -> Any:
    import httpx

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are PlacePro AI career coach. Respond in valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "response_format": {"type": "json_object"} if json_mode else None,
            },
            timeout=60,
        )
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        return json.loads(content) if json_mode else content


async def _gemini(prompt: str, json_mode: bool) -> Any:
    import httpx

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": [{"text": prompt + (" Return JSON only." if json_mode else "")}]}]},
            timeout=60,
        )
        res.raise_for_status()
        text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
        if json_mode:
            text = text.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(text)
        return text


async def _openai_chat(
    messages: list[dict[str, str]],
    json_mode: bool,
    system_prompt: str | None,
) -> Any:
    import httpx

    system = system_prompt or (
        "You are PlacePro AI Career Coach — an expert mentor for Indian engineering students "
        "preparing for campus placements. Be encouraging, specific, and actionable."
    )
    api_messages = [{"role": "system", "content": system}]
    api_messages.extend(messages)

    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": api_messages,
                "response_format": {"type": "json_object"} if json_mode else None,
            },
            timeout=90,
        )
        res.raise_for_status()
        content = res.json()["choices"][0]["message"]["content"]
        return json.loads(content) if json_mode else content


async def _gemini_chat(
    messages: list[dict[str, str]],
    json_mode: bool,
    system_prompt: str | None,
) -> Any:
    import httpx

    system = system_prompt or "You are PlacePro AI Career Coach for placement preparation."
    parts = [{"text": system}]
    for m in messages:
        role = "user" if m["role"] == "user" else "model"
        parts.append({"text": f"{role}: {m['content']}"})
    if json_mode:
        parts.append({"text": "Respond in valid JSON only."})

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json={"contents": [{"parts": parts}]},
            timeout=90,
        )
        res.raise_for_status()
        text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
        if json_mode:
            text = text.strip().removeprefix("```json").removesuffix("```").strip()
            return json.loads(text)
        return text
