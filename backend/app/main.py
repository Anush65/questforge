from fastapi import FastAPI
from app.core.database import Base, engine
from app.routes import hackathon, team

app = FastAPI(title="QuestForge API")

app.include_router(hackathon.router)
app.include_router(team.router)

Base.metadata.create_all(bind=engine)

@app.get("/health")
def health():
    return {"status": "ok"}
