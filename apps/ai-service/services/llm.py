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
