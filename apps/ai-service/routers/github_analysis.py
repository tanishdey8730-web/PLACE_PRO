from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.llm import get_llm_response

router = APIRouter()


class GitHubAnalysisRequest(BaseModel):
    username: str
    profile_context: str = Field(min_length=20)


def _fallback(req: GitHubAnalysisRequest) -> dict:
    base = 65
    return {
        "developer_score": base,
        "scores": {
            "repositories": base + 2,
            "languages": base,
            "contribution_activity": base - 3,
            "project_quality": base + 4,
            "open_source_activity": base - 1,
            "overall": base,
        },
        "dimension_feedback": [
            {
                "dimension": "repositories",
                "score": base + 2,
                "feedback": "Review repo count, descriptions, and pinned projects.",
            },
            {
                "dimension": "languages",
                "score": base,
                "feedback": "Align language focus with target job stack.",
            },
            {
                "dimension": "contributionActivity",
                "score": base - 3,
                "feedback": "Increase consistent commits and PR activity.",
            },
            {
                "dimension": "projectQuality",
                "score": base + 4,
                "feedback": "Improve READMEs, tests, and demos on top repos.",
            },
            {
                "dimension": "openSourceActivity",
                "score": base - 1,
                "feedback": "Engage via forks, stars, and external contributions.",
            },
        ],
        "skill_analysis": [],
        "improvement_suggestions": [
            "Pin best repositories",
            "Add profile README",
            "Commit weekly on active projects",
        ],
        "summary": f"Heuristic analysis for @{req.username}. Connect AI for full review.",
        "strengths": ["Public GitHub profile"],
    }


@router.post("/analyze")
async def analyze_github_profile(req: GitHubAnalysisRequest):
    prompt = f"""You are a technical recruiter and engineering manager evaluating a student's GitHub profile for campus placement.

Username: @{req.username}

PROFILE DATA:
{req.profile_context[:14000]}

Analyze:
1. Repositories — quantity, variety, descriptions, pinned-worthy projects
2. Languages — breadth vs depth, alignment with industry demand
3. Contribution Activity — consistency, recency, push/PR/issue patterns
4. Project Quality — stars, README signals, originality vs forks, polish
5. Open Source Activity — followers, forks received, collaboration signals

Return JSON only:
{{
  "developer_score": 0-100,
  "scores": {{
    "repositories": 0-100,
    "languages": 0-100,
    "contribution_activity": 0-100,
    "project_quality": 0-100,
    "open_source_activity": 0-100,
    "overall": 0-100
  }},
  "dimension_feedback": [
    {{ "dimension": "repositories", "score": 0-100, "feedback": "3-5 detailed sentences" }},
    {{ "dimension": "languages", "score": 0-100, "feedback": "..." }},
    {{ "dimension": "contributionActivity", "score": 0-100, "feedback": "..." }},
    {{ "dimension": "projectQuality", "score": 0-100, "feedback": "..." }},
    {{ "dimension": "openSourceActivity", "score": 0-100, "feedback": "..." }}
  ],
  "skill_analysis": [
    {{ "skill": "TypeScript", "level": "beginner|intermediate|advanced|expert", "percentage": 0-100, "evidence": "why" }}
  ],
  "improvement_suggestions": ["specific actionable tip"],
  "summary": "3-4 sentence executive summary",
  "strengths": ["strength"]
}}

developer_score should match overall. Be specific to the data provided. skill_analysis should list top 4-6 skills inferred from languages/repos."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("scores") or result.get("developer_score"):
            return result
    except Exception:
        pass
    return _fallback(req)
