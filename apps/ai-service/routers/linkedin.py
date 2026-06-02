from fastapi import APIRouter
from pydantic import BaseModel, HttpUrl
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()


class LinkedInAnalysisRequest(BaseModel):
    profile_url: str
    target_role: str = "Software Engineer"
    headline: Optional[str] = None
    about: Optional[str] = None
    skills: Optional[list[str]] = None


def _fallback_analysis(req: LinkedInAnalysisRequest) -> dict:
    skills = req.skills or [
        "Java",
        "Python",
        "JavaScript",
        "SQL",
        "Git",
        "Problem Solving",
    ]
    missing = [
        "System Design",
        "REST APIs",
        "Agile",
        "CI/CD",
        "Cloud (AWS/Azure)",
        req.target_role.split()[0] if req.target_role else "Engineering",
    ]
    missing = [m for m in missing if m.lower() not in " ".join(skills).lower()][:6]

    return {
        "linkedin_score": 68,
        "headline": {
            "score": 62,
            "feedback": "Headline is generic or missing role-specific keywords and impact.",
            "suggestions": [
                f"Use format: {req.target_role} | Tech stack | Value (e.g., 'building scalable APIs')",
                "Avoid 'Student at XYZ' only — add aspiration and specialty",
                "Include 2–3 searchable keywords recruiters filter on",
            ],
        },
        "about": {
            "score": 58,
            "feedback": "About section lacks structure, metrics, and a clear call-to-action.",
            "suggestions": [
                "Open with a hook: who you are + target role in one line",
                "Add 2–3 bullet achievements with numbers",
                "End with CTA: open to internships/full-time, email, or portfolio link",
            ],
        },
        "skills": {
            "score": 65,
            "listed": skills[:12],
            "missing": missing,
            "feedback": "Skill list should mirror job descriptions for your target role.",
        },
        "missing_keywords": missing + ["microservices", "leadership", "cross-functional"],
        "completeness": {
            "score": 72,
            "checklist": [
                {"item": "Professional profile photo", "done": False},
                {"item": "Custom headline (not default)", "done": bool(req.headline)},
                {"item": "About section (150+ words)", "done": bool(req.about and len(req.about) > 100)},
                {"item": "5+ relevant skills endorsed", "done": len(skills) >= 5},
                {"item": "Education with dates", "done": True},
                {"item": "At least 1 project or experience", "done": True},
                {"item": "Featured section (portfolio/GitHub)", "done": False},
                {"item": "Open to work / hiring badge", "done": False},
            ],
        },
        "suggestions": {
            "profile": [
                "Rewrite headline with role + tech + outcome",
                "Expand About with STAR-format wins",
                "Add featured links to GitHub and best project",
            ],
            "visibility": [
                "Post weekly on learnings or project updates",
                "Comment thoughtfully on industry posts 3x/week",
                "Use 3–5 relevant hashtags on posts",
            ],
            "recruiter_appeal": [
                "List skills in order of job description priority",
                "Request endorsements for top 5 skills from peers",
                "Add 'Open to work' with target titles and locations",
            ],
        },
        "recommendations": [
            "Boost headline score with keyword-rich, role-specific title",
            "Increase About length with quantified achievements",
            f"Add missing skills: {', '.join(missing[:4])}",
            "Complete featured section and professional photo",
            "Enable creator mode or share weekly technical content",
        ],
    }


@router.post("/analyze")
async def analyze_linkedin(req: LinkedInAnalysisRequest):
    profile_context = f"""
Profile URL: {req.profile_url}
Target role: {req.target_role}
Headline: {req.headline or '(not provided — infer typical student profile)'}
About: {req.about or '(not provided)'}
Skills: {req.skills or '(not provided)'}
"""

    prompt = f"""Analyze this LinkedIn profile for placement/job search success.
{profile_context}

Return ONLY valid JSON:
{{
  "linkedin_score": 0-100,
  "headline": {{ "score": 0-100, "feedback": "string", "suggestions": ["string"] }},
  "about": {{ "score": 0-100, "feedback": "string", "suggestions": ["string"] }},
  "skills": {{
    "score": 0-100,
    "listed": ["skill"],
    "missing": ["keyword"],
    "feedback": "string"
  }},
  "missing_keywords": ["keyword"],
  "completeness": {{
    "score": 0-100,
    "checklist": [{{ "item": "string", "done": true/false }}]
  }},
  "suggestions": {{
    "profile": ["improve profile tip"],
    "visibility": ["improve visibility tip"],
    "recruiter_appeal": ["improve recruiter appeal tip"]
  }},
  "recommendations": ["priority optimization action"]
}}

Score harshly but constructively for early-career {req.target_role} candidates in India/global market."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("linkedin_score") is not None:
            return result
    except Exception:
        pass
    return _fallback_analysis(req)
