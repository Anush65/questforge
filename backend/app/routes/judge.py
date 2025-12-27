from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.judge import Judge
from app.schemas.judge import JudgeCreateRequest

router = APIRouter(prefix="/judges", tags=["Judges"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_judge(
    payload: JudgeCreateRequest,
    db: Session = Depends(get_db)
):
    judge = Judge(
        name=payload.name,
        email=payload.email
    )
    db.add(judge)
    db.commit()
    db.refresh(judge)

    return judge
