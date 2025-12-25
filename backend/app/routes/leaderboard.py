from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import SessionLocal
from app.models.evaluation import Evaluation
from app.models.team import Team

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def leaderboard(db: Session = Depends(get_db)):
    results = (
        db.query(
            Team.team_name,
            func.avg(Evaluation.score).label("avg_score")
        )
        .join(Evaluation, Team.id == Evaluation.team_id)
        .group_by(Team.id)
        .order_by(func.avg(Evaluation.score).desc())
        .all()
    )

    return results
