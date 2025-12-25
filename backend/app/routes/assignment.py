from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.team import Team
from app.models.judge import Judge
from app.models.judge_assignment import JudgeAssignment
from app.core.assignment import assign_teams_to_judges

router = APIRouter(prefix="/assignments", tags=["Assignments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/run")
def run_assignment(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    judges = db.query(Judge).all()

    assignments = assign_teams_to_judges(teams, judges)

    for a in assignments:
        db.add(JudgeAssignment(
            judge_id=a["judge_id"],
            team_id=a["team_id"]
        ))

    db.commit()

    return {"message": "Judges assigned successfully"}
