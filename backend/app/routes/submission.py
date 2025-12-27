from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.models.team import Team
from app.models.submission import Submission
from app.models.hackathon import Hackathon
from app.schemas.submission import SubmissionCreateRequest

router = APIRouter(prefix="/submissions", tags=["Submissions"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def submit_project(
    payload: SubmissionCreateRequest,
    db: Session = Depends(get_db)
):
    # 1. Validate team via token
    team = db.query(Team).filter(
        Team.team_token == payload.team_token
    ).first()

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Invalid team token"
        )

    # 2. Check if hackathon is frozen
    hackathon = db.query(Hackathon).filter(
        Hackathon.id == team.hackathon_id
    ).first()

    if hackathon.is_frozen:
        raise HTTPException(
            status_code=403,
            detail="Submissions are closed for this hackathon"
        )

    # 3. Create submission
    submission = Submission(
        team_id=team.id,
        github_url=payload.github_url,
        prototype_url=payload.prototype_url,
        video_url=payload.video_url,
        report_text=payload.report_text
    )

    db.add(submission)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This team has already submitted a project"
        )

    return {
        "message": "Submission successful",
        "team_id": team.id
    }
