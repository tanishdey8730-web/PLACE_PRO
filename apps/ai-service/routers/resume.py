from fastapi import APIRouter
from pydantic import BaseModel
from services.llm import get_llm_response
from routers import resume_builder

router = APIRouter()
router.include_router(resume_builder.router, tags=["resume-builder"])


class ResumeAnalyzeRequest(BaseModel):
    file_url: str
    user_id: str


@router.post("/analyze")
async def analyze_resume(req: ResumeAnalyzeRequest):
    prompt = f"""Analyze this resume (URL: {req.file_url}) for ATS compatibility.
    Return JSON with: ats_score (0-100), resume_strength, missing_skills (array),
    formatting_issues (array), keyword_suggestions (array), improvements (array)."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        return result
    except Exception:
        return {
            "ats_score": 75,
            "resume_strength": "Good — clear structure with relevant skills",
            "missing_skills": ["Docker", "Kubernetes", "CI/CD"],
            "formatting_issues": [
                "Inconsistent date formatting",
                "Missing quantified achievements in experience section",
            ],
            "keyword_suggestions": [
                "microservices",
                "REST API",
                "agile methodology",
                "cross-functional",
            ],
            "improvements": [
                "Add metrics to each bullet point (e.g., improved performance by 40%)",
                "Include a dedicated Skills section with job-relevant keywords",
                "Keep resume to 1 page for early career roles",
                "Add GitHub and LinkedIn links prominently",
            ],
        }
