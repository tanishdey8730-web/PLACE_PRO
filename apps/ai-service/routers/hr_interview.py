from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()

STANDARD_QUESTIONS = [
    {"id": "about", "question": "Tell me about yourself"},
    {"id": "strengths", "question": "What are your strengths?"},
    {"id": "weaknesses", "question": "What are your weaknesses?"},
    {"id": "career_goals", "question": "What are your career goals?"},
    {"id": "why_hire", "question": "Why should we hire you?"},
]


class HrAnswerItem(BaseModel):
    question_id: str
    question: str
    answer: str


class HrInterviewRequest(BaseModel):
    action: str = "evaluate"
    target_role: str = "Software Engineer"
    company_name: Optional[str] = None
    answers: list[HrAnswerItem]
    duration_seconds: Optional[int] = None


def _fallback_evaluate(req: HrInterviewRequest) -> dict:
    avg_len = sum(len(a.answer.split()) for a in req.answers) / max(len(req.answers), 1)
    base = 70 if avg_len >= 25 else 58

    return {
        "scores": {
            "communication": min(95, base + 8),
            "confidence": min(95, base + 4),
            "clarity": min(95, base + 6),
            "professionalism": min(95, base + 10),
            "overall": min(95, base + 7),
        },
        "question_feedback": [
            {
                "question_id": a.question_id,
                "score": base,
                "feedback": "Expand with STAR format and one measurable outcome.",
            }
            for a in req.answers
        ],
        "summary": f"Mock HR interview completed for {req.target_role}. Practice concise, structured answers.",
        "strengths": ["Completed all HR questions", "Professional intent in responses"],
        "improvements": ["Add metrics to answers", "Reduce filler words", "Stronger opening for 'about yourself'"],
        "recommendations": [
            "Practice 5 questions daily with 90-second timer",
            "Record and review clarity and pace",
        ],
    }


@router.post("/evaluate")
async def evaluate_hr_interview(req: HrInterviewRequest):
    transcript = "\n\n".join(
        [f"Q ({a.question_id}): {a.question}\nA: {a.answer}" for a in req.answers]
    )

    prompt = f"""Evaluate this mock HR interview for a {req.target_role} candidate.
Company: {req.company_name or "General"}

Standard HR questions covered. Transcript:
{transcript[:8000]}

Return JSON only:
{{
  "scores": {{
    "communication": 0-100,
    "confidence": 0-100,
    "clarity": 0-100,
    "professionalism": 0-100,
    "overall": 0-100
  }},
  "question_feedback": [
    {{ "question_id": "about", "score": 0-100, "feedback": "specific tip" }}
  ],
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength"],
  "improvements": ["improvement"],
  "recommendations": ["next step"]
}}

Score communication (structure, articulation), confidence (assertiveness), clarity (concise, logical), professionalism (tone, relevance)."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("scores"):
            return result
    except Exception:
        pass
    return _fallback_evaluate(req)
