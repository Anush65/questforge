from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.team import Team
from app.models.hackathon import Hackathon
from app.core.utils import generate_team_token

router = APIRouter(prefix="/teams", tags=["Teams"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register_team(
    team_name: str,
    project_title: str,
    hackathon_code: str,
    db: Session = Depends(get_db)
):
    # Find hackathon by invite code
    hackathon = db.query(Hackathon).filter(
        Hackathon.invite_code == hackathon_code
    ).first()

    if not hackathon:
        return {"error": "Invalid hackathon code"}

    # Create team
    team = Team(
        team_name=team_name,
        project_title=project_title,
        hackathon_id=hackathon.id,
        team_token=generate_team_token()
    )

    db.add(team)
    db.commit()
    db.refresh(team)

    return {
        "team_id": team.id,
        "team_name": team.team_name,
        "project_title": team.project_title,
        "team_token": team.team_token
    }
