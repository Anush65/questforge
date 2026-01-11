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

@router.get("/hackathon/{hackathon_id}")
def get_assignments_by_hackathon(hackathon_id: int, db: Session = Depends(get_db)):
    """Get all judge assignments for teams in a specific hackathon"""
    from app.models.judge import Judge
    
    # Get all teams for this hackathon
    teams = db.query(Team).filter(Team.hackathon_id == hackathon_id).all()
    team_ids = [t.id for t in teams]
    
    if not team_ids:
        return []
    
    # Get all assignments for these teams
    assignments = db.query(JudgeAssignment).filter(
        JudgeAssignment.team_id.in_(team_ids)
    ).all()
    
    # Get judge and team info
    result = []
    for assignment in assignments:
        judge = db.query(Judge).filter(Judge.id == assignment.judge_id).first()
        team = db.query(Team).filter(Team.id == assignment.team_id).first()
        
        if judge and team:
            result.append({
                "judge_id": judge.id,
                "judge_name": judge.name,
                "judge_email": judge.email,
                "team_id": team.id,
                "team_name": team.team_name,
                "project_title": team.project_title
            })
    
    return result