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

    # 3. Check for existing submission
    existing_submission = db.query(Submission).filter(
        Submission.team_id == team.id
    ).first()

    if existing_submission:
        # Update existing
        existing_submission.github_url = str(payload.github_url)
        if payload.prototype_url:
            existing_submission.prototype_url = str(payload.prototype_url)
        if payload.video_url:
            existing_submission.video_url = str(payload.video_url)
        if payload.presentation_url:
            existing_submission.presentation_url = str(payload.presentation_url)
        if payload.usp:
            existing_submission.usp = payload.usp
        if payload.report_text:
            existing_submission.report_text = payload.report_text
        
        db.commit()
        return {
            "message": "Submission updated successfully",
            "team_id": team.id
        }
    else:
        # Create new
        submission = Submission(
            team_id=team.id,
            github_url=str(payload.github_url),
            prototype_url=str(payload.prototype_url) if payload.prototype_url else None,
            video_url=str(payload.video_url) if payload.video_url else None,
            presentation_url=str(payload.presentation_url) if payload.presentation_url else None,
            usp=payload.usp,
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

@router.get("/")
def list_submissions(hackathon_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Submission, Team.project_title, Team.team_name)\
        .join(Team, Submission.team_id == Team.id)
    
    if hackathon_id:
        query = query.filter(Team.hackathon_id == hackathon_id)
    
    results = query.all()
    
    # Format response
    response = []
    for sub, title, team_name in results:
        response.append({
            "id": sub.id,
            "title": title,
            "team_name": team_name,
            "team_id": sub.team_id, # [NEW] Required for grading
            "hackathon_id": hackathon_id,
            "github_url": sub.github_url,
            "usp": sub.usp,
            "presentation_url": sub.presentation_url,
            "video_url": sub.video_url,
            "prototype_url": sub.prototype_url,
            "score": None # Placeholder
        })
    return response
