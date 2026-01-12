from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.judge_assignment import JudgeAssignment
from app.models.team import Team
from app.models.submission import Submission

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

@router.get("/{judge_id}/submissions")
def get_assigned_submissions(judge_id: int, db: Session = Depends(get_db)):
    # Get assigned team IDs
    assignments = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == judge_id
    ).all()

    team_ids = [a.team_id for a in assignments]

    if not team_ids:
        return []

    # Get submissions for assigned teams
    results = db.query(Submission, Team.project_title, Team.team_name)\
        .join(Team, Submission.team_id == Team.id)\
        .filter(Submission.team_id.in_(team_ids))\
        .all()

    # Format response
    response = []
    for sub, title, team_name in results:
        response.append({
            "id": sub.id,
            "title": title,
            "team_name": team_name,
            "team_id": sub.team_id,
            "github_url": sub.github_url,
            "usp": sub.usp,
            "presentation_url": sub.presentation_url,
            "video_url": sub.video_url,
            "prototype_url": sub.prototype_url,
            "score": None  # Placeholder
        })
    return response
