from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from services.llm import get_llm_response

router = APIRouter()

TOPIC_CONTEXT = {
    "instagram": "Photo/video social network: feeds, media CDN, fan-out, stories, likes/comments.",
    "whatsapp": "Real-time messaging: WebSockets, delivery receipts, groups, E2E encryption, presence.",
    "uber": "Ride marketplace: geo-matching, trip state machine, pricing, live location, payments.",
    "youtube": "Video platform: upload/transcode pipeline, adaptive streaming, recommendations, CDN.",
}


class SystemDesignRequest(BaseModel):
    topic_id: str = Field(min_length=3)
    topic_title: str = "System Design"
    design: str = Field(min_length=50)
    scale_hint: Optional[str] = None
    discussion_points: list[str] = Field(default_factory=list)


def _fallback(req: SystemDesignRequest) -> dict:
    text = req.design.lower()
    words = len(req.design.split())
    base = 58 if words < 150 else 68 if words < 350 else 76

    def dim_score(keywords: list[str]) -> float:
        hits = sum(1 for k in keywords if k in text)
        return min(95.0, base + hits * 5)

    scores = {
        "scalability": dim_score(["scale", "shard", "cdn", "kafka", "queue", "million"]),
        "architecture": dim_score(["service", "api", "gateway", "micro", "event"]),
        "database_design": dim_score(["sql", "nosql", "redis", "index", "replica"]),
        "caching": dim_score(["cache", "redis", "cdn", "ttl"]),
        "security": dim_score(["auth", "encrypt", "jwt", "rate", "tls"]),
        "overall": 0.0,
    }
    scores["overall"] = round(
        sum(scores[k] for k in ["scalability", "architecture", "database_design", "caching", "security"]) / 5,
        1,
    )

    dimensions = [
        ("scalability", "Scalability"),
        ("architecture", "Architecture"),
        ("database_design", "Database Design"),
        ("caching", "Caching"),
        ("security", "Security"),
    ]

    return {
        "scores": scores,
        "dimension_feedback": [
            {
                "dimension": d.replace("_design", "Design").replace("database", "database")
                if d == "database_design"
                else d,
                "score": scores[d],
                "feedback": f"{label}: expand with technologies, trade-offs, and estimates.",
                "improvements": [
                    f"Add more depth on {label.lower()}",
                    "Include failure modes and mitigations",
                ],
            }
            for d, label in dimensions
        ],
        "summary": f"Mock evaluation for {req.topic_title}. AI service offline — heuristic scores applied.",
        "strengths": ["Submitted a structured design", "Covers multiple system components"],
        "improvements": [
            "Add quantitative capacity planning",
            "Deepen database and cache strategy",
            "Clarify security and auth flows",
        ],
        "recommendations": [
            "Use a consistent outline: requirements → APIs → data → scale → trade-offs",
            "Practice one topic per week with timed 45-minute sessions",
        ],
        "architecture_highlights": [],
    }


@router.post("/evaluate")
async def evaluate_system_design(req: SystemDesignRequest):
    context = TOPIC_CONTEXT.get(req.topic_id, req.topic_title)
    points = "\n".join(f"- {p}" for p in req.discussion_points[:8])

    prompt = f"""You are a senior staff engineer conducting a system design interview.
Evaluate the candidate's design for: {req.topic_title}
Context: {context}
Scale: {req.scale_hint or "Large-scale global system"}

Key areas interviewers expect:
{points}

CANDIDATE DESIGN:
{req.design[:12000]}

Score each dimension 0-100 and give DETAILED, actionable feedback (3-5 sentences per dimension).

Return JSON only:
{{
  "scores": {{
    "scalability": 0-100,
    "architecture": 0-100,
    "database_design": 0-100,
    "caching": 0-100,
    "security": 0-100,
    "overall": 0-100
  }},
  "dimension_feedback": [
    {{
      "dimension": "scalability",
      "score": 0-100,
      "feedback": "detailed paragraph on horizontal scaling, bottlenecks, fan-out, estimates",
      "improvements": ["specific improvement 1", "specific improvement 2"]
    }},
    {{
      "dimension": "architecture",
      "score": 0-100,
      "feedback": "detailed paragraph on services, boundaries, sync/async, diagrams",
      "improvements": ["..."]
    }},
    {{
      "dimension": "databaseDesign",
      "score": 0-100,
      "feedback": "detailed paragraph on schema, sharding, consistency, indexes",
      "improvements": ["..."]
    }},
    {{
      "dimension": "caching",
      "score": 0-100,
      "feedback": "detailed paragraph on cache layers, TTL, invalidation, CDN",
      "improvements": ["..."]
    }},
    {{
      "dimension": "security",
      "score": 0-100,
      "feedback": "detailed paragraph on auth, encryption, abuse prevention",
      "improvements": ["..."]
    }}
  ],
  "summary": "3-4 sentence executive summary for the candidate",
  "strengths": ["specific strength"],
  "improvements": ["cross-cutting improvement"],
  "recommendations": ["study or practice recommendation"],
  "architecture_highlights": ["notable architectural decision from their answer"]
}}

Be rigorous. overall should reflect weighted average of dimensions. Reference their actual design choices."""

    try:
        result = await get_llm_response(prompt, json_mode=True)
        if result.get("scores"):
            return result
    except Exception:
        pass
    return _fallback(req)
