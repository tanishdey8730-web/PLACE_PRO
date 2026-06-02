from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.llm import get_llm_response
import json

router = APIRouter()


class DailyChallengeRequest(BaseModel):
    placement_goal: str = "general"
    placement_goal_label: str = "General placement prep"
    weak_topics: list[str] = Field(default_factory=list)
    progress: dict = Field(default_factory=dict)


def _fallback(req: DailyChallengeRequest) -> dict:
    topics = req.weak_topics or ["Arrays", "Aptitude", "Interview"]
    return {
        "summary": f"Daily pack for {req.placement_goal_label} targeting {', '.join(topics[:3])}.",
        "challenges": [
            {
                "type": "dsa",
                "topic": topics[0],
                "difficulty": "MEDIUM",
                "title": f"DSA: {topics[0]}",
                "prompt": f"Solve a medium problem related to {topics[0]}.",
                "hints": ["Outline brute force then optimize"],
                "estimated_minutes": 25,
            },
            {
                "type": "aptitude",
                "topic": "Quantitative Aptitude",
                "difficulty": "MEDIUM",
                "title": "Daily aptitude",
                "prompt": "If 25% of a number is 50, find the number.",
                "options": ["150", "200", "250", "300"],
                "correct_answer": "200",
                "hints": ["Divide by percentage"],
                "estimated_minutes": 3,
            },
            {
                "type": "interview",
                "topic": "HR",
                "difficulty": "EASY",
                "title": "Interview practice",
                "prompt": "Why should we hire you for a software role?",
                "hints": ["Use 3 strengths with examples"],
                "estimated_minutes": 5,
            },
        ],
    }


@router.post("/generate")
async def generate_daily_challenges(req: DailyChallengeRequest):
    weak = ", ".join(req.weak_topics[:6]) or "general CS fundamentals"
    progress = json.dumps(req.progress)[:2000]

    prompt = f"""Generate a personalized DAILY challenge set for a campus placement student.

Placement goal: {req.placement_goal_label} ({req.placement_goal})
Weak topics to prioritize: {weak}
Progress snapshot: {progress}

Create exactly 6 challenges:
- 2 DSA coding problems (title, prompt, difficulty EASY/MEDIUM/HARD, topic from weak areas)
- 2 aptitude MCQs (question, 4 options, correct_answer, topic)
- 2 interview questions (behavioral or technical, aligned with placement goal)

Return JSON only:
{{
  "summary": "1-2 sentence motivational overview for today",
  "challenges": [
    {{
      "type": "dsa",
      "topic": "Graphs",
      "difficulty": "MEDIUM",
      "title": "short title",
      "prompt": "full problem statement",
      "hints": ["hint1", "hint2"],
      "estimated_minutes": 25
    }},
    {{
      "type": "aptitude",
      "topic": "Logical Reasoning",
      "difficulty": "EASY",
      "title": "short title",
      "prompt": "question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "B",
      "hints": ["hint"],
      "estimated_minutes": 3
    }},
    {{
      "type": "interview",
      "topic": "Technical",
      "difficulty": "MEDIUM",
      "title": "short title",
      "prompt": "question for student to answer aloud or in writing",
      "hints": ["structure tip"],
      "estimated_minutes": 8
    }}
  ]
}}

Tailor difficulty to progress scores. DSA prompts must be self-contained (no external links)."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("challenges"):
            return result
    except Exception:
        pass
    return _fallback(req)
