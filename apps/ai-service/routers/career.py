from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any, Optional
from services.llm import get_llm_response

router = APIRouter()


class CareerPlanRequest(BaseModel):
    skills: Optional[list[str]] = None
    college: Optional[str] = None
    scores: Optional[Any] = None
    target_role: str = "Software Engineer"


@router.post("/plan")
async def career_plan(req: CareerPlanRequest):
    prompt = f"""Create a personalized career plan for someone targeting {req.target_role}.
    Profile: skills={req.skills}, college={req.college}, scores={req.scores}
    Return JSON: career_path, learning_plan (array of week/focus/hours),
    certifications, recommended_companies, strengths, improvements."""

    try:
        return await get_llm_response(prompt, json_mode=True)
    except Exception:
        paths = {
            "Software Engineer": {
                "learning_plan": [
                    {"week": 1, "focus": "Arrays, Strings, Hash Maps", "hours": 12},
                    {"week": 2, "focus": "Linked Lists, Stacks, Queues", "hours": 12},
                    {"week": 3, "focus": "Trees & Graphs BFS/DFS", "hours": 15},
                    {"week": 4, "focus": "Dynamic Programming patterns", "hours": 15},
                    {"week": 5, "focus": "System Design fundamentals", "hours": 10},
                    {"week": 6, "focus": "Mock interviews & aptitude", "hours": 10},
                ],
                "certifications": ["AWS Cloud Practitioner", "Meta Front-End Developer"],
            },
            "Data Scientist": {
                "learning_plan": [
                    {"week": 1, "focus": "Python & Pandas", "hours": 12},
                    {"week": 2, "focus": "Statistics & Probability", "hours": 10},
                    {"week": 3, "focus": "Machine Learning basics", "hours": 15},
                    {"week": 4, "focus": "SQL & data visualization", "hours": 12},
                ],
                "certifications": ["Google Data Analytics", "IBM Data Science"],
            },
        }
        default = paths.get("Software Engineer")
        return {
            "career_path": req.target_role,
            "learning_plan": default["learning_plan"],
            "certifications": default["certifications"],
            "recommended_companies": [
                "Google",
                "Microsoft",
                "Amazon",
                "Flipkart",
                "Goldman Sachs",
            ],
            "strengths": ["Analytical thinking", "Self-motivated learning"],
            "improvements": ["Mock interviews", "Resume optimization", "Aptitude speed"],
        }
