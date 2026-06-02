from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, interview, career, roadmap, linkedin, cover_letter, placement_probability, career_coach, job_match, hr_interview, system_design, project_review, github_analysis, daily_challenge, networking, salary_predictor

app = FastAPI(title="PlacePro AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume", tags=["resume"])
app.include_router(interview.router, prefix="/api/interview", tags=["interview"])
app.include_router(career.router, prefix="/api/career", tags=["career"])
app.include_router(roadmap.router, prefix="/api/roadmap", tags=["roadmap"])
app.include_router(linkedin.router, prefix="/api/linkedin", tags=["linkedin"])
app.include_router(cover_letter.router, prefix="/api/cover-letter", tags=["cover-letter"])
app.include_router(placement_probability.router, prefix="/api/placement-probability", tags=["placement-probability"])
app.include_router(career_coach.router, prefix="/api/career-coach", tags=["career-coach"])
app.include_router(job_match.router, prefix="/api/job-match", tags=["job-match"])
app.include_router(hr_interview.router, prefix="/api/hr-interview", tags=["hr-interview"])
app.include_router(system_design.router, prefix="/api/system-design", tags=["system-design"])
app.include_router(project_review.router, prefix="/api/project-review", tags=["project-review"])
app.include_router(github_analysis.router, prefix="/api/github-analysis", tags=["github-analysis"])
app.include_router(daily_challenge.router, prefix="/api/daily-challenge", tags=["daily-challenge"])
app.include_router(networking.router, prefix="/api/networking", tags=["networking"])
app.include_router(salary_predictor.router, prefix="/api/salary-predictor", tags=["salary-predictor"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "placepro-ai"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
