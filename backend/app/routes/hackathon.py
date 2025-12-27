from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.hackathon import Hackathon
from app.core.utils import generate_invite_code
from app.schemas.hackathon import HackathonCreateRequest

# ✅ THIS MUST COME BEFORE USING @router
router = APIRouter(prefix="/hackathons", tags=["Hackathons"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_hackathon(
    payload: HackathonCreateRequest,
    db: Session = Depends(get_db)
):
    hackathon = Hackathon(
        name=payload.name,
        invite_code=generate_invite_code()
    )
    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)

    return hackathon

@router.post("/{hackathon_id}/freeze")
def freeze_hackathon(hackathon_id: int, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(
        Hackathon.id == hackathon_id
    ).first()

    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    hackathon.is_frozen = True
    db.commit()

    return {"message": "Submissions frozen"}

@router.post("/{hackathon_id}/unfreeze")
def unfreeze_hackathon(hackathon_id: int, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(
        Hackathon.id == hackathon_id
    ).first()

    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

    hackathon.is_frozen = False
    db.commit()

    return {"message": "Submissions reopened"}
