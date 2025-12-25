from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.models.evaluation import Evaluation
from app.models.judge_assignment import JudgeAssignment
from app.schemas.evaluation import EvaluationCreateRequest

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def submit_evaluation(
    payload: EvaluationCreateRequest,
    db: Session = Depends(get_db)
):
    # Ensure judge is assigned to this team
    assignment = db.query(JudgeAssignment).filter(
        JudgeAssignment.judge_id == payload.judge_id,
        JudgeAssignment.team_id == payload.team_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="Judge not assigned to this team"
        )

    evaluation = Evaluation(
        judge_id=payload.judge_id,
        team_id=payload.team_id,
        score=payload.score
    )

    db.add(evaluation)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Evaluation already submitted"
        )

    return {"message": "Evaluation submitted"}
