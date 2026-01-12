from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.models.evaluation import Evaluation
from app.schemas.evaluation import EvaluationCreateRequest

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_evaluations(
    judge_id: int = None,
    team_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Evaluation)
    if judge_id:
        query = query.filter(Evaluation.judge_id == judge_id)
    if team_id:
        query = query.filter(Evaluation.team_id == team_id)
    
    evaluations = query.all()
    return [
        {
            "id": e.id,
            "judge_id": e.judge_id,
            "team_id": e.team_id,
            "score": e.score
        }
        for e in evaluations
    ]


@router.post("/")
def submit_evaluation(
    payload: EvaluationCreateRequest,
    db: Session = Depends(get_db)
):
    # Check if evaluation already exists
    existing = db.query(Evaluation).filter(
        Evaluation.judge_id == payload.judge_id,
        Evaluation.team_id == payload.team_id
    ).first()
    
    if existing:
        # Update existing evaluation with new score
        existing.score = payload.score
        db.commit()
        db.refresh(existing)  # Refresh to ensure we have the latest data
        return {"message": "Evaluation updated", "score": existing.score}
    else:
        # Create new evaluation
        evaluation = Evaluation(
            judge_id=payload.judge_id,
            team_id=payload.team_id,
            score=payload.score
        )
        db.add(evaluation)
        try:
            db.commit()
            db.refresh(evaluation)
            return {"message": "Evaluation submitted", "score": evaluation.score}
        except IntegrityError:
            db.rollback()
            # If we get here, another request created it between our check and insert
            # Try to update it instead
            existing = db.query(Evaluation).filter(
                Evaluation.judge_id == payload.judge_id,
                Evaluation.team_id == payload.team_id
            ).first()
            if existing:
                existing.score = payload.score
                db.commit()
                db.refresh(existing)
                return {"message": "Evaluation updated", "score": existing.score}
            raise HTTPException(status_code=409, detail="Evaluation already submitted")
