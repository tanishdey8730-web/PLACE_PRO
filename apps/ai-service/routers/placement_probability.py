from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()


class PlacementProbabilityRequest(BaseModel):
    cgpa: float = Field(ge=0, le=10)
    dsa_score: float = Field(ge=0, le=100)
    aptitude_score: float = Field(ge=0, le=100)
    resume_score: float = Field(ge=0, le=100)
    projects: int = Field(ge=0, le=20)
    certifications: int = Field(ge=0, le=20)
    target_role: str = "Software Engineer"
    branch: Optional[str] = "Computer Science"


def _fallback(req: PlacementProbabilityRequest) -> dict:
  cgpa_norm = min(100, (req.cgpa / 10) * 100) if req.cgpa <= 10 else req.cgpa
  base = (
      cgpa_norm * 0.12
      + req.dsa_score * 0.32
      + req.aptitude_score * 0.22
      + req.resume_score * 0.22
      + min(95, req.projects * 22) * 0.08
      + min(90, req.certifications * 25) * 0.04
  )

  companies = [
      ("Google", "google", "Product", max(8, min(95, base * 0.55 - 5))),
      ("Amazon", "amazon", "Product", max(10, min(95, base * 0.62))),
      ("Microsoft", "microsoft", "Product", max(12, min(95, base * 0.65))),
      ("Meta", "meta", "Product", max(8, min(95, base * 0.52))),
      ("Adobe", "adobe", "Product", max(15, min(95, base * 0.72))),
      ("Atlassian", "atlassian", "Product", max(18, min(95, base * 0.74))),
      ("TCS", "tcs", "Service", max(40, min(99, base * 1.15 + 15))),
      ("Infosys", "infosys", "Service", max(38, min(99, base * 1.12 + 12))),
      ("Wipro", "wipro", "Service", max(42, min(99, base * 1.18 + 18))),
      ("Accenture", "accenture", "Service", max(40, min(99, base * 1.1 + 14))),
  ]

  probs = [
      {
          "company": name,
          "slug": slug,
          "probability": round(prob, 1),
          "tier": tier,
      }
      for name, slug, tier, prob in companies
  ]
  probs.sort(key=lambda x: x["probability"], reverse=True)

  overall = round(sum(p["probability"] for p in probs) / len(probs), 1)

  suggestions = []
  if req.dsa_score < 70:
      suggestions.append("Boost DSA preparation — target 75+ for product company shortlists.")
  if req.aptitude_score < 65:
      suggestions.append("Increase aptitude practice for service company drives.")
  if req.resume_score < 75:
      suggestions.append("Optimize resume ATS score and add quantified achievements.")
  if req.projects < 2:
      suggestions.append("Ship at least 2 strong portfolio projects.")
  if not suggestions:
      suggestions.append("Continue mock interviews and company-specific prep.")

  return {
      "overall_probability": overall,
      "readiness_level": "Strong" if overall >= 75 else "Good" if overall >= 55 else "Moderate" if overall >= 35 else "Low",
      "company_probabilities": probs,
      "improvement_suggestions": suggestions,
  }


@router.post("/predict")
async def predict_placement(req: PlacementProbabilityRequest):
    prompt = f"""Predict campus placement probability for an Indian engineering student.

Inputs:
- CGPA: {req.cgpa} (scale 0-10 if <=10)
- DSA score: {req.dsa_score}/100
- Aptitude score: {req.aptitude_score}/100
- Resume score: {req.resume_score}/100
- Projects count: {req.projects}
- Certifications count: {req.certifications}
- Target role: {req.target_role}
- Branch: {req.branch}

Return JSON only:
{{
  "overall_probability": 0-100,
  "readiness_level": "Low|Moderate|Good|Strong",
  "company_probabilities": [
    {{ "company": "Google", "slug": "google", "probability": 35, "tier": "Product" }},
    {{ "company": "Amazon", "slug": "amazon", "probability": 52, "tier": "Product" }},
    {{ "company": "Microsoft", "slug": "microsoft", "probability": 48, "tier": "Product" }},
    {{ "company": "Meta", "slug": "meta", "probability": 32, "tier": "Product" }},
    {{ "company": "Adobe", "slug": "adobe", "probability": 55, "tier": "Product" }},
    {{ "company": "Atlassian", "slug": "atlassian", "probability": 50, "tier": "Product" }},
    {{ "company": "TCS", "slug": "tcs", "probability": 95, "tier": "Service" }},
    {{ "company": "Infosys", "slug": "infosys", "probability": 88, "tier": "Service" }},
    {{ "company": "Wipro", "slug": "wipro", "probability": 92, "tier": "Service" }},
    {{ "company": "Accenture", "slug": "accenture", "probability": 85, "tier": "Service" }}
  ],
  "improvement_suggestions": ["actionable tip"]
}}

Rules:
- Service companies (TCS, Infosys, Wipro, Accenture) typically higher probability than FAANG for average students
- Product companies weight DSA heavily
- Probabilities must be realistic (Google rarely above 60% for students)
- Include all 10 companies"""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("overall_probability") is not None:
            return result
    except Exception:
        pass
    return _fallback(req)
