from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()


class JobMatchRequest(BaseModel):
    resume: str = Field(min_length=20)
    job_description: str = Field(min_length=20)
    job_title: Optional[str] = None
    company_name: Optional[str] = None


def _fallback(req: JobMatchRequest) -> dict:
    resume_lower = req.resume.lower()
    jd_lower = req.job_description.lower()
    checks = [
        ("docker", "Docker"),
        ("aws", "AWS"),
        ("kubernetes", "Kubernetes"),
        ("react", "React"),
        ("python", "Python"),
        ("java", "Java"),
        ("system design", "System Design"),
        ("ci/cd", "CI/CD"),
    ]
    missing = [label for key, label in checks if key in jd_lower and key not in resume_lower]
    matched = [label for key, label in checks if key in jd_lower and key in resume_lower]

    score = 72 + min(20, len(matched) * 4) - min(15, len(missing) * 3)
    score = max(35, min(92, score))

    return {
        "match_score": round(score, 1),
        "missing_skills": missing[:8] if missing else ["Review job description for additional requirements"],
        "strengths": [
            f"Aligned skills: {', '.join(matched[:5])}" if matched else "Core engineering fundamentals present",
            "Resume structure supports ATS parsing",
        ],
        "weaknesses": [
            f"Gap in required skills: {', '.join(missing[:4])}" if missing else "Minor keyword tuning recommended",
            "Consider adding more quantified impact metrics",
        ],
        "matched_keywords": matched,
        "recommendations": [
            f"Highlight {missing[0]} in projects if you have exposure" if missing else "Strong match — customize summary per application",
            "Use exact job description phrases in top 3 bullets",
        ],
    }


@router.post("/analyze")
async def analyze_job_match(req: JobMatchRequest):
    prompt = f"""Analyze resume vs job description for campus/early-career hiring match.

Job title: {req.job_title or "Not specified"}
Company: {req.company_name or "Not specified"}

RESUME:
{req.resume[:6000]}

JOB DESCRIPTION:
{req.job_description[:6000]}

Return JSON only:
{{
  "match_score": 0-100,
  "missing_skills": ["skill not evidenced in resume"],
  "strengths": ["strength for this role"],
  "weaknesses": ["gap or risk"],
  "matched_keywords": ["keyword found in both"],
  "recommendations": ["action to improve match"]
}}

Be realistic. match_score 85+ only for strong alignment."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("match_score") is not None:
            return result
    except Exception:
        pass
    return _fallback(req)
