from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any
from services.llm import get_llm_response

router = APIRouter()


class QuestionsRequest(BaseModel):
    interview_type: str
    target_role: str = "Software Engineer"


class AnalyzeRequest(BaseModel):
    transcript: Any
    interview_type: str


@router.post("/questions")
async def generate_questions(req: QuestionsRequest):
    prompt = f"""Generate 8 interview questions for a {req.interview_type} interview
    for a {req.target_role} role. Return JSON: {{"questions": ["q1", ...]}}"""

    try:
        return await get_llm_response(prompt, json_mode=True)
    except Exception:
        type_questions = {
            "TECHNICAL": [
                "Explain time complexity of binary search.",
                "Design a URL shortener.",
                "What is the difference between process and thread?",
                "Implement LRU cache approach.",
                "Explain CAP theorem.",
                "How does HTTP/2 differ from HTTP/1.1?",
                "Describe database indexing.",
                "What are microservices trade-offs?",
            ],
            "HR": [
                "Why do you want to join our company?",
                "What are your salary expectations?",
                "Where do you see yourself in 5 years?",
                "Why should we hire you?",
                "Describe your ideal work environment.",
                "How do you handle feedback?",
                "What motivates you?",
                "Are you open to relocation?",
            ],
            "BEHAVIORAL": [
                "Tell me about a time you failed and what you learned.",
                "Describe a conflict with a teammate and resolution.",
                "Give an example of leadership without authority.",
                "When did you go above and beyond?",
                "How do you prioritize under pressure?",
                "Describe adapting to a major change.",
                "Tell me about mentoring someone.",
                "Share a data-driven decision you made.",
            ],
        }
        questions = type_questions.get(
            req.interview_type.upper(),
            type_questions["TECHNICAL"],
        )
        return {"questions": questions}


@router.post("/analyze")
async def analyze_interview(req: AnalyzeRequest):
    prompt = f"""Analyze this mock interview transcript for a {req.interview_type} interview.
    Transcript: {req.transcript}
    Return JSON with scores 0-100: communication, confidence, technical_accuracy, speech_clarity,
    body_language (string), suggestions (array of strings)."""

    try:
        return await get_llm_response(prompt, json_mode=True)
    except Exception:
        return {
            "communication": 78,
            "confidence": 72,
            "technical_accuracy": 70,
            "speech_clarity": 75,
            "body_language": "Maintain eye contact; reduce fidgeting",
            "suggestions": [
                "Use the STAR method for behavioral answers",
                "Pause briefly before answering technical questions",
                "Provide concrete examples with metrics",
                "Ask clarifying questions when needed",
            ],
        }
