from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()


class ProjectReviewRequest(BaseModel):
    repo_url: str
    repo_full_name: str = "owner/repo"
    repo_context: str = Field(min_length=20)


def _fallback(req: ProjectReviewRequest) -> dict:
    ctx = req.repo_context.lower()
    base = 62
    if "has tests: true" in ctx:
        base += 8
    if "has ci" in ctx and "true" in ctx:
        base += 6
    if len(req.repo_context) > 800:
        base += 5

    scores = {
        "code_quality": min(92, base + 4),
        "architecture": min(90, base),
        "documentation": min(88, base - 4 if "no readme" in ctx else base + 6),
        "resume_worthiness": min(90, base + 2),
        "overall": min(90, base + 3),
    }

    return {
        "scores": scores,
        "dimension_feedback": [
            {
                "dimension": "codeQuality",
                "score": scores["code_quality"],
                "feedback": "Heuristic review — add tests, linting, and CI for stronger code quality signals.",
            },
            {
                "dimension": "architecture",
                "score": scores["architecture"],
                "feedback": "Clarify module boundaries and include an architecture section in the README.",
            },
            {
                "dimension": "documentation",
                "score": scores["documentation"],
                "feedback": "Expand README with setup, features, env vars, and screenshots or demo link.",
            },
            {
                "dimension": "resumeWorthiness",
                "score": scores["resume_worthiness"],
                "feedback": "Highlight tech stack, your contributions, and measurable impact for recruiters.",
            },
        ],
        "missing_features": [
            "Live demo URL",
            "Architecture diagram",
            "Comprehensive test coverage",
        ],
        "improvement_suggestions": [
            "Add resume-ready bullet points to README",
            "Deploy a public demo",
            "Enable GitHub Actions CI badge",
        ],
        "summary": f"Offline heuristic evaluation for {req.repo_full_name}. Connect AI service for deeper review.",
        "strengths": ["Public GitHub repository", "Available for portfolio review"],
        "tech_stack": [],
    }


@router.post("/analyze")
async def analyze_project(req: ProjectReviewRequest):
    prompt = f"""You are a senior engineering hiring manager reviewing a student's GitHub project for campus placement.

Repository: {req.repo_full_name}
URL: {req.repo_url}

GITHUB DATA:
{req.repo_context[:14000]}

Evaluate for:
1. Code Quality — structure, testing signals, CI, maintainability (infer from repo layout; you cannot see all source)
2. Architecture — separation of concerns, scalability patterns, appropriate tech choices
3. Documentation — README depth, setup clarity, diagrams, API docs
4. Resume Worthiness — would this impress recruiters? impact, complexity, relevance
5. Missing Features — what important pieces are absent

Return JSON only:
{{
  "scores": {{
    "code_quality": 0-100,
    "architecture": 0-100,
    "documentation": 0-100,
    "resume_worthiness": 0-100,
    "overall": 0-100
  }},
  "dimension_feedback": [
    {{ "dimension": "codeQuality", "score": 0-100, "feedback": "2-4 detailed sentences" }},
    {{ "dimension": "architecture", "score": 0-100, "feedback": "..." }},
    {{ "dimension": "documentation", "score": 0-100, "feedback": "..." }},
    {{ "dimension": "resumeWorthiness", "score": 0-100, "feedback": "..." }}
  ],
  "missing_features": ["specific missing item"],
  "improvement_suggestions": ["actionable suggestion"],
  "summary": "3-4 sentence executive summary",
  "strengths": ["strength"],
  "tech_stack": ["inferred tech"]
}}

Be honest and specific. Reference actual README/structure signals. overall = weighted average of the four dimension scores."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("scores"):
            return result
    except Exception:
        pass
    return _fallback(req)
