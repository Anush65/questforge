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

@router.get("/")
def list_hackathons(db: Session = Depends(get_db)):
    return db.query(Hackathon).all()

@router.post("/")
def create_hackathon(
    payload: HackathonCreateRequest,
    db: Session = Depends(get_db)
):
    # Use provided code or generate one
    code = payload.invite_code if payload.invite_code else generate_invite_code()
    
    hackathon = Hackathon(
        name=payload.name,
        invite_code=code
    )
    db.add(hackathon)
    db.commit()
    db.refresh(hackathon)

    return hackathon

@router.delete("/{hackathon_id}")
def delete_hackathon(hackathon_id: int, db: Session = Depends(get_db)):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
         raise HTTPException(status_code=404, detail="Hackathon not found")
    
    db.delete(hackathon)
    db.commit()
    return {"message": "Hackathon deleted"}

@router.get("/code/{invite_code}")
def get_hackathon_by_code(invite_code: str, db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    hackathon = db.query(Hackathon).filter(
        func.lower(Hackathon.invite_code) == func.lower(invite_code)
    ).first()

    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")

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

@router.put("/{hackathon_id}")
def update_hackathon(
    hackathon_id: int,
    payload: HackathonCreateRequest,
    db: Session = Depends(get_db)
):
    hackathon = db.query(Hackathon).filter(Hackathon.id == hackathon_id).first()
    if not hackathon:
        raise HTTPException(status_code=404, detail="Hackathon not found")
    
    hackathon.name = payload.name
    if payload.invite_code:
        hackathon.invite_code = payload.invite_code
    hackathon.is_frozen = payload.is_frozen
    
    db.commit()
    db.refresh(hackathon)
    
    return hackathon