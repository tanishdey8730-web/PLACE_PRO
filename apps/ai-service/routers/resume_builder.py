from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Optional, Literal
from services.llm import get_llm_response

router = APIRouter()

SectionType = Literal["projects", "internships", "achievements", "skills", "summary"]


class ResumeBuilderRequest(BaseModel):
    action: str = "build"
    template: str = "ats"
    target_role: str = "Software Engineer"
    generate_section: Optional[SectionType] = None
    content: Optional[Any] = None
    context: Optional[Any] = None


def _fallback_scores(content: dict) -> dict:
    personal = content.get("personal") or {}
    skills = content.get("skills") or []
    projects = content.get("projects") or []
    score = 50
    if personal.get("fullName"):
        score += 5
    if personal.get("email"):
        score += 5
    if personal.get("summary"):
        score += 10
    if len(skills) >= 5:
        score += 10
    if projects:
        score += 15
    if content.get("experience") or content.get("internships"):
        score += 10
    if content.get("achievements"):
        score += 5
    ats = min(score + 8, 92)
    quality = min(score + 3, 88)
    return {
        "ats_score": ats,
        "quality_score": quality,
        "feedback": [
            "Add quantified metrics to project bullets",
            "Include role-specific keywords in skills section",
            "Keep formatting consistent across sections",
        ],
        "keyword_suggestions": ["REST API", "agile", "CI/CD", "microservices"],
    }


def _fallback_generate(section: str, target_role: str, context: dict) -> dict:
    branch = context.get("branch", "Computer Science")
    if section == "skills":
        return {
            "skills": [
                "Java",
                "Python",
                "Data Structures & Algorithms",
                "SQL",
                "Git",
                "REST APIs",
                "Problem Solving",
                "Object-Oriented Design",
            ]
        }
    if section == "achievements":
        return {
            "achievements": [
                "Ranked in top 5% of class in Data Structures course",
                "Winner, inter-college hackathon (team of 4)",
                "Published technical blog with 2k+ monthly readers",
            ]
        }
    if section == "projects":
        return {
            "projects": [
                {
                    "name": "Placement Prep Platform",
                    "tech": "React, Node.js, PostgreSQL",
                    "bullets": [
                        f"Built full-stack app for {target_role} candidates with 500+ active users",
                        "Reduced page load time by 35% via code splitting and caching",
                        "Integrated JWT auth and role-based access control",
                    ],
                },
                {
                    "name": "Real-Time Chat Application",
                    "tech": "Socket.io, Express, MongoDB",
                    "bullets": [
                        "Implemented WebSocket messaging with typing indicators",
                        "Designed schema supporting 10k concurrent connections in load tests",
                    ],
                },
            ]
        }
    if section == "internships":
        return {
            "internships": [
                {
                    "company": "Tech Startup",
                    "role": f"{target_role} Intern",
                    "start": "May 2024",
                    "end": "Jul 2024",
                    "bullets": [
                        "Developed REST APIs consumed by mobile and web clients",
                        "Fixed 20+ bugs and improved unit test coverage to 75%",
                        "Collaborated in agile sprints with daily standups",
                    ],
                }
            ]
        }
    if section == "summary":
        return {
            "personal": {
                "summary": (
                    f"Motivated {branch} graduate targeting {target_role} roles with strong "
                    "fundamentals in DSA, full-stack development, and collaborative project work."
                )
            }
        }
    return {}


@router.post("/builder")
async def resume_builder(req: ResumeBuilderRequest):
    content = req.content or {}
    ctx = req.context or {}

    if req.action == "generate" and req.generate_section:
        section = req.generate_section
        prompt = f"""Generate resume content for a {req.target_role} candidate.
Section to generate: {section}
Existing profile context: {ctx}
Current resume snippet: {content}

Return JSON only:
- projects: {{ "projects": [{{ "name", "tech", "bullets": [] }}] }}
- internships: {{ "internships": [{{ "company", "role", "start", "end", "bullets": [] }}] }}
- achievements: {{ "achievements": ["string"] }}
- skills: {{ "skills": ["string"] }}
- summary: {{ "personal": {{ "summary": "2-3 sentences" }} }}

Use action verbs, quantified impact, ATS keywords for {req.target_role}."""

        try:
            result = await get_llm_response(prompt, json_mode=True)
            if result:
                return result
        except Exception:
            pass
        return _fallback_generate(section, req.target_role, ctx)

    prompt = f"""Score this resume for ATS and overall quality for {req.target_role}.
Template style: {req.template}
Resume JSON: {content}

Return JSON:
{{
  "ats_score": 0-100,
  "quality_score": 0-100,
  "feedback": ["actionable tip"],
  "keyword_suggestions": ["keyword"],
  "generated": null
}}"""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("ats_score") is not None:
            return result
    except Exception:
        pass
    return _fallback_scores(content if isinstance(content, dict) else {})
