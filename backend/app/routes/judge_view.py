from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.judge_assignment import JudgeAssignment
from app.models.team import Team

router = APIRouter(prefix="/judge-view", tags=["Judge View"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{judge_id}/teams")
def get_assigned_teams(judge_id: int, db: Session = Depends(get_db)):
    assignments = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id
    ).all()

    team_ids = [a.team_id for a in assignments]

    teams = db.query(Team).filter(Team.id.in_(team_ids)).all()

    return teams
