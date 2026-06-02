from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()

COMPANY_TYPES = ["PRODUCT", "SERVICE", "STARTUP", "FAANG", "MNC", "CONSULTING"]


class SalaryPredictorRequest(BaseModel):
    skills: list[str] = Field(default_factory=list)
    experience_years: float = Field(ge=0, le=40)
    location: str = "Bangalore"
    company_type: str = "PRODUCT"
    role: Optional[str] = "Software Engineer"


def _location_mult(location: str) -> float:
    loc = location.lower()
    if any(x in loc for x in ["bangalore", "bengaluru", "mumbai", "hyderabad", "gurgaon", "gurugram", "noida"]):
        return 1.0
    if any(x in loc for x in ["pune", "chennai", "delhi"]):
        return 0.92
    if "remote" in loc or "us" in loc or "usa" in loc:
        return 1.15
    return 0.85


def _company_mult(company_type: str) -> float:
    m = {
        "FAANG": 1.45,
        "PRODUCT": 1.2,
        "STARTUP": 1.05,
        "MNC": 1.1,
        "CONSULTING": 1.15,
        "SERVICE": 0.75,
    }
    return m.get(company_type.upper(), 1.0)


def _fallback(req: SalaryPredictorRequest) -> dict:
    skill_bonus = min(8, len(req.skills) * 0.4)
    hot = sum(
        1
        for s in req.skills
        if s.lower() in ["aws", "kubernetes", "system design", "machine learning", "react", "python", "java"]
    )
    skill_bonus += min(4, hot * 0.6)

    base = 3.5 + req.experience_years * 1.8 + skill_bonus
    base *= _location_mult(req.location)
    base *= _company_mult(req.company_type)

    if req.experience_years < 1:
        base = max(3.0, min(base, 12.0))

    median = round(base, 1)
    spread = max(1.2, median * 0.18)
    min_lpa = round(max(2.5, median - spread), 1)
    max_lpa = round(median + spread * 1.2, 1)

    growth_score = min(95, 45 + req.experience_years * 4 + len(req.skills) * 2 + hot * 5)
    if req.company_type.upper() == "FAANG":
        growth_score = min(98, growth_score + 10)
    elif req.company_type.upper() == "SERVICE":
        growth_score = max(35, growth_score - 15)

    five_year = {
        "min_lpa": round(median * 1.6, 1),
        "max_lpa": round(max_lpa * 2.2, 1),
    }

    return {
        "salary_range": {
            "min_lpa": min_lpa,
            "max_lpa": max_lpa,
            "median_lpa": median,
            "currency": "INR",
            "period": "annual",
        },
        "market_insights": [
            {
                "title": f"{req.location} market demand",
                "description": (
                    f"Engineering roles in {req.location} show steady hiring for "
                    f"{req.role or 'developers'} with {', '.join(req.skills[:3]) or 'core'} skills."
                ),
                "trend": "up" if req.company_type.upper() in ["FAANG", "PRODUCT", "STARTUP"] else "stable",
            },
            {
                "title": f"{req.company_type.replace('_', ' ').title()} compensation bands",
                "description": (
                    "Product and FAANG tiers pay premiums for DSA + system design; "
                    "services firms cluster around campus median with faster volume hiring."
                ),
                "trend": "stable",
            },
            {
                "title": "Skill premium",
                "description": (
                    f"Candidates with {len(req.skills)} listed skills often negotiate "
                    f"₹{round(skill_bonus * 100000):,}+ higher vs baseline fresher packages."
                ).replace(",", ","),
                "trend": "up" if hot >= 2 else "stable",
            },
        ],
        "growth_potential": {
            "score": growth_score,
            "outlook": (
                "Strong upside with role switches and equity in high-growth companies"
                if growth_score >= 75
                else "Moderate growth via promotions and skill upskilling"
                if growth_score >= 55
                else "Steady increments; focus on tier-1 skills to accelerate"
            ),
            "factors": [
                f"{req.experience_years} years experience baseline",
                f"Company type: {req.company_type}",
                f"Location factor: {req.location}",
                "High-demand skills boost negotiation leverage" if hot >= 2 else "Add cloud/DSA depth for next jump",
            ],
            "five_year_projection": five_year,
        },
    }


@router.post("/predict")
async def predict_salary(req: SalaryPredictorRequest):
    skills_str = ", ".join(req.skills) if req.skills else "general software skills"
    prompt = f"""Predict salary for Indian tech market (LPA = Lakhs Per Annum, annual INR).

Inputs:
- Role: {req.role}
- Skills: {skills_str}
- Experience: {req.experience_years} years
- Location: {req.location}
- Company type: {req.company_type} (one of {COMPANY_TYPES})

Return ONLY valid JSON:
{{
  "salary_range": {{
    "min_lpa": number,
    "max_lpa": number,
    "median_lpa": number,
    "currency": "INR",
    "period": "annual"
  }},
  "market_insights": [
    {{ "title": "string", "description": "string", "trend": "up|stable|down" }}
  ],
  "growth_potential": {{
    "score": 0-100,
    "outlook": "2-3 sentences",
    "factors": ["string"],
    "five_year_projection": {{ "min_lpa": number, "max_lpa": number }}
  }}
}}

Use realistic 2024-2026 India campus and early-career bands. Fresher service: 3.5-6 LPA; FAANG new grad: 18-45+ LPA.
Be conservative for inflated inputs."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("salary_range"):
            return result
    except Exception:
        pass
    return _fallback(req)
