from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, interview, career

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


@app.get("/health")
def health():
    return {"status": "ok", "service": "placepro-ai"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
