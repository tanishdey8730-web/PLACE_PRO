from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()

ROADMAP_CATEGORIES = [
    "DSA",
    "APTITUDE",
    "SYSTEM_DESIGN",
    "CORE_SUBJECTS",
    "PROJECTS",
    "RESUME_BUILDING",
]


class RoadmapGenerateRequest(BaseModel):
    branch: str
    graduation_year: int = 2026
    skill_level: str = "INTERMEDIATE"
    target_companies: list[str] = []
    study_hours_per_day: int = 3
    college: Optional[str] = None
    skills: Optional[list[str]] = None


def _fallback_roadmap(req: RoadmapGenerateRequest) -> dict:
    hours = req.study_hours_per_day
    companies = req.target_companies or ["Google", "Microsoft", "Amazon", "Flipkart"]
    daily_tasks = []
    categories_cycle = [
        ("DSA", "Solve 2 array/string problems on LeetCode"),
        ("APTITUDE", "Practice 20 quantitative aptitude questions"),
        ("DSA", "Revise trees/graphs — 1 medium problem"),
        ("CORE_SUBJECTS", "Study OS/DBMS concepts for 1 hour"),
        ("APTITUDE", "Logical reasoning mock set (30 min)"),
        ("PROJECTS", "Work on portfolio project feature"),
        ("DSA", "Dynamic programming pattern practice"),
    ]
    for day in range(1, 15):
        cat, title = categories_cycle[(day - 1) % len(categories_cycle)]
        daily_tasks.append(
            {
                "id": f"day-{day}",
                "day": day,
                "category": cat,
                "title": title,
                "duration_minutes": min(hours * 60, 180),
                "description": f"Day {day} focus for {req.branch} placement prep.",
            }
        )

    return {
        "summary": f"Personalized {req.branch} placement roadmap targeting {', '.join(companies[:3])}.",
        "timeline_months": 6,
        "adaptive_tips": [
            "Increase DSA hours if mock test scores stay below 70%.",
            "Add company-specific aptitude sets 8 weeks before interviews.",
            "Schedule weekly mock interviews from month 4 onward.",
        ],
        "categories": {
            cat: {
                "priority": "high" if cat in ("DSA", "APTITUDE") else "medium",
                "weekly_hours": hours if cat == "DSA" else max(2, hours // 2),
                "focus_topics": _category_topics(cat, req.branch),
            }
            for cat in ROADMAP_CATEGORIES
        },
        "monthly_goals": [
            {
                "month": 1,
                "title": "Foundation — DSA & Aptitude basics",
                "categories": ["DSA", "APTITUDE", "CORE_SUBJECTS"],
                "targets": ["Complete 40 easy DSA problems", "Aptitude accuracy > 60%"],
            },
            {
                "month": 2,
                "title": "Intermediate patterns & core subjects",
                "categories": ["DSA", "CORE_SUBJECTS", "APTITUDE"],
                "targets": ["30 medium DSA problems", "Finish OS & DBMS revision"],
            },
            {
                "month": 3,
                "title": "Projects & resume",
                "categories": ["PROJECTS", "RESUME_BUILDING", "DSA"],
                "targets": ["Ship 1 portfolio project", "ATS resume score > 75"],
            },
            {
                "month": 4,
                "title": "System design & company prep",
                "categories": ["SYSTEM_DESIGN", "APTITUDE", "DSA"],
                "targets": ["5 system design case studies", "Company-specific aptitude"],
            },
            {
                "month": 5,
                "title": "Mock interviews & weak-area drills",
                "categories": ["DSA", "APTITUDE", "RESUME_BUILDING"],
                "targets": ["4 mock interviews", "Fix top 3 skill gaps"],
            },
            {
                "month": 6,
                "title": "Final revision & applications",
                "categories": ["DSA", "APTITUDE", "RESUME_BUILDING"],
                "targets": ["Apply to target companies", "Daily revision loops"],
            },
        ],
        "weekly_milestones": [
            {
                "week": w,
                "title": f"Week {w}: {_week_focus(w)}",
                "categories": ["DSA", "APTITUDE"] if w % 2 else ["DSA", "CORE_SUBJECTS"],
                "hours": hours * 7,
                "deliverable": f"Week {w} checkpoint — review progress and adjust plan.",
            }
            for w in range(1, 9)
        ],
        "daily_tasks": daily_tasks,
        "target_companies": companies,
        "skill_gaps": ["Dynamic Programming", "System Design", "Aptitude speed"],
    }


def _category_topics(category: str, branch: str) -> list[str]:
    topics = {
        "DSA": ["Arrays", "Strings", "Trees", "Graphs", "DP"],
        "APTITUDE": ["Quantitative", "Logical reasoning", "Data interpretation"],
        "SYSTEM_DESIGN": ["Scalability", "Caching", "Load balancing", "Databases"],
        "CORE_SUBJECTS": ["OS", "DBMS", "Networks", "OOP"],
        "PROJECTS": ["Full-stack app", "Open source contribution"],
        "RESUME_BUILDING": ["ATS keywords", "Impact metrics", "GitHub profile"],
    }
    base = topics.get(category, [])
    if branch.lower().startswith("cse") or "computer" in branch.lower():
        return base
    return base[:3]


def _week_focus(week: int) -> str:
    focuses = [
        "Arrays & Strings mastery",
        "Linked lists, stacks & queues",
        "Trees & graph traversals",
        "Dynamic programming patterns",
        "Core CS subjects revision",
        "System design fundamentals",
        "Projects & resume polish",
        "Mock tests & interview prep",
    ]
    return focuses[min(week - 1, len(focuses) - 1)]


@router.post("/generate")
async def generate_roadmap(req: RoadmapGenerateRequest):
    companies = ", ".join(req.target_companies) if req.target_companies else "top product companies"
    prompt = f"""Create a detailed placement preparation roadmap as JSON for an Indian college student.

Profile:
- Branch: {req.branch}
- Graduation year: {req.graduation_year}
- Current skill level: {req.skill_level}
- Target companies: {companies}
- Study hours per day: {req.study_hours_per_day}
- College: {req.college or "N/A"}
- Existing skills: {req.skills or []}

Return ONLY valid JSON with this exact structure:
{{
  "summary": "2-3 sentence overview",
  "timeline_months": 6,
  "adaptive_tips": ["tip for adjusting plan based on progress"],
  "categories": {{
    "DSA": {{ "priority": "high|medium|low", "weekly_hours": number, "focus_topics": ["topic"] }},
    "APTITUDE": {{ ... }},
    "SYSTEM_DESIGN": {{ ... }},
    "CORE_SUBJECTS": {{ ... }},
    "PROJECTS": {{ ... }},
    "RESUME_BUILDING": {{ ... }}
  }},
  "monthly_goals": [
    {{ "month": 1, "title": "...", "categories": ["DSA"], "targets": ["measurable target"] }}
  ],
  "weekly_milestones": [
    {{ "week": 1, "title": "...", "categories": ["DSA"], "hours": number, "deliverable": "..." }}
  ],
  "daily_tasks": [
    {{
      "id": "day-1",
      "day": 1,
      "category": "DSA|APTITUDE|SYSTEM_DESIGN|CORE_SUBJECTS|PROJECTS|RESUME_BUILDING",
      "title": "specific task",
      "duration_minutes": number,
      "description": "actionable steps"
    }}
  ],
  "target_companies": ["company names"],
  "skill_gaps": ["gap to address"]
}}

Requirements:
- Include at least 14 daily_tasks spanning all 6 categories
- Include 6 monthly_goals and 8 weekly_milestones
- Scale difficulty to skill level ({req.skill_level})
- Personalize for {req.branch} branch and {companies}
- daily_tasks ids must be unique strings like day-1, day-2, etc."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if not result.get("daily_tasks"):
            return _fallback_roadmap(req)
        return result
    except Exception:
        return _fallback_roadmap(req)
