from fastapi import FastAPI
from app.core.database import Base, engine
from app.routes import hackathon, team, leaderboard
from app.routes.submission import router as submission_router
from app.routes.judge import router as judge_router
from app.routes.assignment import router as assignment_router
from app.routes.evaluation import router as evaluation_router
from app.routes.judge_view import router as judge_view_router

app = FastAPI(title="QuestForge API")

app.include_router(hackathon.router)
app.include_router(team.router)
app.include_router(leaderboard.router)
app.include_router(submission_router)
app.include_router(judge_router)
app.include_router(assignment_router)
app.include_router(evaluation_router)
app.include_router(judge_view_router)

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}
