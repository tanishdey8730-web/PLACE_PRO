from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.llm import get_llm_response
import json

router = APIRouter()


class NetworkingContext(BaseModel):
    name: Optional[str] = "Student"
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[list[str]] = None
    linkedin_url: Optional[str] = None
    bio: Optional[str] = None


class PlatformHint(BaseModel):
    type: str
    name: str
    title: str
    company: Optional[str] = None
    college: Optional[str] = None
    expertise: Optional[list[str]] = None


class NetworkingRequest(BaseModel):
    target_role: str = "Software Engineer"
    target_companies: list[str] = Field(default_factory=list)
    industry: Optional[str] = "Technology"
    networking_goal: Optional[str] = "campus placement and referrals"
    context: Optional[NetworkingContext] = None
    platform_hints: Optional[list[PlatformHint]] = None


def _fallback(req: NetworkingRequest) -> dict:
    companies = req.target_companies or ["Google", "Microsoft", "Amazon"]
    role = req.target_role
    college = (req.context.college if req.context else None) or "your college"

    return {
        "summary": (
            f"Focus on building warm paths to {role} roles at {', '.join(companies[:3])}. "
            "Prioritize alumni intros, recruiter visibility, and 2–3 mentor conversations per month."
        ),
        "recruiters": [
            {
                "name": "Priya Sharma",
                "title": "Technical Recruiter",
                "company": companies[0],
                "linkedin_url": "https://linkedin.com/in/example-recruiter",
                "match_score": 88,
                "reason": f"Hires early-career {role} profiles for {companies[0]}",
                "connection_tip": "Engage with her hiring posts before sending a connection note",
            },
            {
                "name": "James Chen",
                "title": "University Recruiting Lead",
                "company": companies[1] if len(companies) > 1 else "Microsoft",
                "match_score": 82,
                "reason": "Runs campus hiring loops for engineering roles",
                "connection_tip": "Mention your college placement cell and specific job ID if available",
            },
        ],
        "alumni": [
            {
                "name": "Rahul Mehta",
                "title": f"{role}",
                "company": companies[0],
                "college": college,
                "match_score": 90,
                "reason": f"Alumni from {college} placed at {companies[0]} within 2 years",
                "connection_tip": "Ask for 15-minute coffee chat about interview process, not referral immediately",
            },
            {
                "name": "Ananya Iyer",
                "title": "SDE II",
                "company": companies[2] if len(companies) > 2 else "Amazon",
                "college": college,
                "match_score": 85,
                "reason": "Similar background; active on LinkedIn sharing prep tips",
                "connection_tip": "Reference a specific post she wrote before connecting",
            },
        ],
        "mentors": [
            {
                "name": "Dr. Vikram Singh",
                "title": "Senior Engineering Mentor",
                "company": "PlacePro Mentor Network",
                "match_score": 87,
                "reason": "Expertise in DSA + system design for product company interviews",
                "connection_tip": "Book a session to review your outreach strategy and resume positioning",
            },
        ],
        "recommendations": [
            {
                "priority": "high",
                "category": "LinkedIn",
                "title": "Optimize profile for recruiter search",
                "description": "Headline and About should mirror target role keywords.",
                "action_steps": [
                    "Add role + top 3 skills to headline",
                    "Pin a project post weekly",
                    "Set Open to Work visibility appropriately",
                ],
            },
            {
                "priority": "medium",
                "category": "Events",
                "title": "Attend virtual hiring events",
                "description": f"Follow {', '.join(companies[:2])} campus pages for webinars.",
                "action_steps": [
                    "Register for next campus webinar",
                    "Prepare 2 thoughtful questions for Q&A",
                    "Connect with speakers within 24 hours",
                ],
            },
        ],
        "linkedin_outreach": [
            {
                "target_type": "ALUMNI",
                "target_name": "Rahul Mehta",
                "target_title": f"{role} at {companies[0]}",
                "purpose": "cold_outreach",
                "subject_line": f"{college} alumni — quick question on {companies[0]} process",
                "message": (
                    f"Hi Rahul, I'm a final-year student from {college} aiming for {role} roles. "
                    f"I noticed your journey to {companies[0]} and would value 15 minutes of advice "
                    "on what helped most in your interviews. Happy to work around your schedule. Thank you!"
                ),
                "tips": ["Keep under 300 characters for connection request", "No resume attachment on first message"],
            },
            {
                "target_type": "RECRUITER",
                "target_name": "Priya Sharma",
                "target_title": "Technical Recruiter",
                "purpose": "follow_up",
                "message": (
                    f"Hi Priya, I applied for {role} opportunities at {companies[0]}. "
                    "I have strong DSA practice and a relevant project in distributed systems. "
                    "Would appreciate any guidance on the next steps in your pipeline."
                ),
                "tips": ["Apply before messaging", "Include one quantified achievement"],
            },
        ],
        "weekly_plan": [
            "Monday: Send 3 alumni connection requests with personalized notes",
            "Wednesday: Comment on recruiter posts + update skills section",
            "Friday: Book 1 mentor session and follow up on pending connections",
            "Weekend: Draft 2 outreach templates and track responses in a spreadsheet",
        ],
    }


@router.post("/generate")
async def generate_networking(req: NetworkingRequest):
    ctx = req.context or NetworkingContext()
    hints = ""
    if req.platform_hints:
        hints = "\nPlatform users you may reference (prefer these when relevant):\n"
        hints += json.dumps([h.model_dump() for h in req.platform_hints[:12]], indent=2)

    prompt = f"""You are an AI Networking Assistant for Indian campus placement and early-career hiring.

Student profile:
- Name: {ctx.name}
- College: {ctx.college}
- Graduation year: {ctx.graduation_year}
- Skills: {ctx.skills}
- LinkedIn: {ctx.linkedin_url}
- Bio: {ctx.bio}

Goals:
- Target role: {req.target_role}
- Target companies: {req.target_companies}
- Industry: {req.industry}
- Networking goal: {req.networking_goal}
{hints}

Return ONLY valid JSON:
{{
  "summary": "2-3 sentence networking strategy",
  "recruiters": [
    {{
      "name": "string",
      "title": "string",
      "company": "string",
      "linkedin_url": "string or null",
      "match_score": 0-100,
      "reason": "why connect",
      "connection_tip": "actionable tip"
    }}
  ],
  "alumni": [same shape with college field],
  "mentors": [same shape],
  "recommendations": [
    {{
      "priority": "high|medium|low",
      "category": "LinkedIn|Events|Referrals|Community",
      "title": "string",
      "description": "string",
      "action_steps": ["string"]
    }}
  ],
  "linkedin_outreach": [
    {{
      "target_type": "RECRUITER|ALUMNI|MENTOR",
      "target_name": "string",
      "target_title": "string",
      "purpose": "cold_outreach|follow_up|thank_you|referral_request",
      "subject_line": "string or null",
      "message": "full message draft",
      "tips": ["string"]
    }}
  ],
  "weekly_plan": ["day-by-day action"]
}}

Provide 3-4 recruiters, 3-4 alumni, 2-3 mentors, 4-5 recommendations, 3-4 outreach templates.
Use realistic Indian/global tech names. match_score should reflect relevance."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("summary"):
            return result
    except Exception:
        pass
    return _fallback(req)
