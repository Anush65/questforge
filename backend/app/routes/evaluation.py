from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.database import SessionLocal
from app.core.db_helpers import fetchone, execute
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
    assignment = fetchone(
        "SELECT 1 as exists FROM judge_assignments WHERE judge_id = :jid AND team_id = :tid",
        {"jid": payload.judge_id, "tid": payload.team_id}
    )

    if not assignment:
        raise HTTPException(status_code=403, detail="Judge not assigned to this team")

    # Insert evaluation using raw SQL; rely on DB unique constraint to prevent duplicates
    try:
        execute(
            "INSERT INTO evaluations (judge_id, team_id, score) VALUES (:jid, :tid, :score)",
            {"jid": payload.judge_id, "tid": payload.team_id, "score": payload.score}
        )
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Evaluation already submitted")

    return {"message": "Evaluation submitted"}
