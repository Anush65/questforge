from app.core.database import SessionLocal
from app.models.hackathon import Hackathon
import sys

def check_data():
    db = SessionLocal()
    try:
        hackathons = db.query(Hackathon).all()
        print(f"Total Hackathons found: {len(hackathons)}")
        for h in hackathons:
            print(f"ID: {h.id}, Name: {h.name}, Code: {h.invite_code}")
            
        target = db.query(Hackathon).filter(Hackathon.invite_code == "HACK-AI").first()
        if target:
            print("SUCCESS: Found HACK-AI")
        else:
            print("FAILURE: HACK-AI NOT FOUND")
            
    except Exception as e:
        print(f"Error querying DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
