from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Literal
from services.llm import get_llm_response

router = APIRouter()

TemplateType = Literal["professional", "modern", "formal", "concise"]
DocType = Literal[
    "cover_letter",
    "internship_application",
    "referral_request",
    "hr_follow_up",
    "all",
]


class CoverLetterRequest(BaseModel):
    company_name: str
    job_title: str
    resume: str
    skills: list[str] = []
    template: TemplateType = "professional"
    document_type: DocType = "all"
    applicant_name: str = "Applicant"


def _doc(
    subject: str,
    salutation: str,
    body: str,
    closing: str = "Sincerely,",
    signature: str = "Applicant",
) -> dict:
    return {
        "subject": subject,
        "salutation": salutation,
        "body": body,
        "closing": closing,
        "signature": signature,
    }


def _fallback(req: CoverLetterRequest) -> dict:
    name = req.applicant_name
    co = req.company_name
    role = req.job_title
    skills = ", ".join(req.skills[:6]) if req.skills else "relevant technical skills"

    cover_body = (
        f"I am writing to express my strong interest in the {role} position at {co}. "
        f"With hands-on experience highlighted in my resume and proficiency in {skills}, "
        f"I am confident I can contribute to your team from day one.\n\n"
        f"My background includes impactful academic and project work aligned with {co}'s focus on innovation. "
        f"I would welcome the opportunity to discuss how my skills map to your team's goals."
    )

    internship_body = (
        f"I hope this message finds you well. I am applying for the {role} internship at {co}. "
        f"I am currently building practical experience in {skills} through coursework and projects.\n\n"
        f"I am eager to learn from {co}'s engineering culture and contribute to real deliverables. "
        f"My resume outlines projects with measurable outcomes. I am available for the full internship duration."
    )

    referral_body = (
        f"I hope you are doing well. I am reaching out regarding the {role} opening at {co}. "
        f"I noticed you are connected with the team and would greatly appreciate any guidance or referral.\n\n"
        f"I have attached my resume for context. My recent work in {skills} aligns closely with the role. "
        f"Thank you for considering — I understand referrals take your time and appreciate any support."
    )

    followup_body = (
        f"Thank you for the opportunity to apply for the {role} role at {co}. "
        f"I wanted to follow up on my application submitted recently.\n\n"
        f"I remain very interested in joining {co} and believe my experience with {skills} would be valuable. "
        f"Please let me know if you need any additional information. I look forward to hearing from you."
    )

    return {
        "documents": {
            "cover_letter": _doc(
                f"Application for {role} — {name}",
                f"Dear Hiring Manager,",
                cover_body,
                signature=name,
            ),
            "internship_application": _doc(
                f"Internship Application — {role} at {co}",
                f"Dear Hiring Team,",
                internship_body,
                signature=name,
            ),
            "referral_request": _doc(
                f"Referral request — {role} at {co}",
                f"Hi,",
                referral_body,
                closing="Best regards,",
                signature=name,
            ),
            "hr_follow_up": _doc(
                f"Following up — {role} application at {co}",
                f"Dear HR Team,",
                followup_body,
                signature=name,
            ),
        }
    }


@router.post("/generate")
async def generate_cover_letter(req: CoverLetterRequest):
    tone_hints = {
        "professional": "balanced business tone",
        "modern": "confident, approachable, strong hook",
        "formal": "traditional formal letter",
        "concise": "under 250 words per document, short paragraphs",
    }
    tone = tone_hints.get(req.template, "professional")

    doc_instruction = (
        "all four document types"
        if req.document_type == "all"
        else f"only {req.document_type}"
    )

    prompt = f"""Write job application documents for a candidate applying to {req.company_name} for {req.job_title}.
Template tone: {tone}
Applicant name: {req.applicant_name}
Skills: {req.skills}
Resume summary/excerpt:
{req.resume[:4000]}

Generate {doc_instruction} as JSON:
{{
  "documents": {{
    "cover_letter": {{
      "subject": "email subject line",
      "salutation": "Dear ...",
      "body": "multi-paragraph letter with \\n\\n between paragraphs",
      "closing": "Sincerely,",
      "signature": "{req.applicant_name}"
    }},
    "internship_application": {{ ... same structure, internship-focused }},
    "referral_request": {{ ... polite referral email to a connection }},
    "hr_follow_up": {{ ... brief follow-up after applying }}
  }}
}}

Rules:
- Personalize with company name and role
- Reference skills and resume highlights
- No placeholder brackets like [Company]
- Indian/global English OK
- referral_request uses warmer salutation (Hi / Hello)
"""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("documents"):
            docs = result["documents"]
            if req.document_type != "all":
                key_map = {
                    "cover_letter": "cover_letter",
                    "internship_application": "internship_application",
                    "referral_request": "referral_request",
                    "hr_follow_up": "hr_follow_up",
                }
                k = key_map.get(req.document_type)
                if k and k in docs:
                    fallback = _fallback(req)["documents"]
                    for fk in fallback:
                        if fk not in docs:
                            docs[fk] = fallback[fk]
            return result
    except Exception:
        pass
    return _fallback(req)
