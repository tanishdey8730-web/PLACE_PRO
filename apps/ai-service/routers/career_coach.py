from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Optional
from services.llm import get_llm_response, get_llm_chat

router = APIRouter()


class CareerCoachContext(BaseModel):
    branch: Optional[str] = "Computer Science"
    graduation_year: Optional[int] = None
    skills: Optional[list[str]] = None
    college: Optional[str] = None


class CareerCoachRequest(BaseModel):
    action: str = "chat"
    message: Optional[str] = None
    target_role: str = "Software Engineer"
    context: Optional[CareerCoachContext] = None
    history: Optional[list[dict[str, str]]] = None


def _fallback_insights(req: CareerCoachRequest) -> dict:
    role = req.target_role
    skills = (req.context.skills if req.context else None) or ["Java", "Python", "DSA"]
    return {
        "career_guidance": (
            f"Focus on becoming a strong {role} candidate by balancing DSA depth, "
            "one flagship project, and consistent aptitude practice over 3–6 months."
        ),
        "skill_recommendations": [
            "Data Structures & Algorithms (trees, graphs, DP)",
            "Object-oriented design and clean code",
            "SQL and basic system design",
            "Communication for behavioral rounds",
        ],
        "technology_recommendations": [
            "Java or C++ for DSA interviews",
            "Python for projects and data roles",
            "Git, Docker basics, REST APIs",
            "Cloud: AWS or GCP fundamentals",
        ],
        "learning_path": [
            {"phase": "Month 1–2", "focus": "DSA foundations + aptitude basics", "hours_per_week": 15},
            {"phase": "Month 3", "focus": "Medium problems + core CS subjects", "hours_per_week": 18},
            {"phase": "Month 4", "focus": "Projects + resume + mock interviews", "hours_per_week": 16},
            {"phase": "Month 5–6", "focus": "Company-specific prep + drives", "hours_per_week": 20},
        ],
        "placement_strategy": [
            "Apply to service companies early for backup offers",
            "Target 2–3 product firms with dedicated prep tracks",
            "Network on LinkedIn with alumni 2–3 times per week",
            "Maintain spreadsheet of applications and follow-ups",
        ],
        "current_skills_assessed": skills,
    }


def _fallback_chat(message: str, role: str) -> str:
    lower = message.lower()
    if "skill" in lower:
        return (
            f"For {role}, prioritize DSA, one full-stack or backend project, and aptitude. "
            "Spend 60% time on coding, 25% on aptitude, 15% on resume and mocks."
        )
    if "company" in lower or "google" in lower or "amazon" in lower:
        return (
            "Use a tiered strategy: service companies for probability, product firms for growth. "
            "Check Company Prep in PlacePro for round-wise guides and tailor resume keywords."
        )
    if "learning" in lower or "path" in lower:
        return (
            "Start with arrays/strings → trees/graphs → DP. Parallel track: 30 aptitude questions daily. "
            "By month 3, add system design basics and weekly mock interviews."
        )
    return (
        f"I'm your AI Career Coach for {role} placements. Ask me about skills, technologies, "
        "learning paths, company strategy, or your specific situation — I'll give actionable steps."
    )


@router.post("/coach")
async def career_coach(req: CareerCoachRequest):
    ctx = req.context or CareerCoachContext()
    profile = f"Target role: {req.target_role}, branch: {ctx.branch}, skills: {ctx.skills}, college: {ctx.college}"

    if req.action == "insights":
        prompt = f"""Generate comprehensive career coaching insights as JSON.
{profile}

Return JSON:
{{
  "career_guidance": "2-3 sentences",
  "skill_recommendations": ["skill"],
  "technology_recommendations": ["tech stack/tool"],
  "learning_path": [{{ "phase": "string", "focus": "string", "hours_per_week": number }}],
  "placement_strategy": ["strategy tip"],
  "current_skills_assessed": ["skill"]
}}"""
        try:
            return await get_llm_response(prompt, json_mode=True)
        except Exception:
            return _fallback_insights(req)

    message = req.message or "Hello, I need career guidance for placements."
    history = req.history or []
    chat_messages = [{"role": m.get("role", "user"), "content": m.get("content", "")} for m in history[-12:]]
    chat_messages.append({"role": "user", "content": message})

    system = (
        f"You are PlacePro AI Career Coach. Student targets {req.target_role}. Profile: {profile}. "
        "Give concise, actionable advice for Indian campus placements. Use markdown sparingly. "
        "Cover career guidance, skills, tech stack, learning path, or placement strategy as relevant."
    )

    try:
        reply = await get_llm_chat(chat_messages, json_mode=False, system_prompt=system)
        if isinstance(reply, str) and len(reply) > 10:
            return {"reply": reply.strip()}
    except Exception:
        pass

    return {"reply": _fallback_chat(message, req.target_role)}
