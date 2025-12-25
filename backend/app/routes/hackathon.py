from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.hackathon import Hackathon
from app.core.utils import generate_invite_code

router = APIRouter(prefix="/hackathons", tags=["Hackathons"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_hackathon(name: str, db: Session = Depends(get_db)):
    hackathon = Hackathon(
        name=name,
        invite_code=generate_invite_code()
    )
    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)
    return hackathon

@router.get("/join/{code}")
def join_hackathon(code: str, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(
        Hackathon.invite_code == code
    ).first()

    if not hackathon:
        return {"error": "Invalid hackathon code"}

    return hackathon
