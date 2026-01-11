from app.core.database import SessionLocal, engine, Base
from app.models.hackathon import Hackathon
from app.models.team import Team
from app.models.submission import Submission
from app.models.judge import Judge
from app.models.user import User
from app.core.auth import get_password_hash
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed():
    # Reset Tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Hackathon
        hack = db.query(Hackathon).filter(Hackathon.invite_code == "HACK-AI").first()
        if not hack:
            hack = Hackathon(
                name="GLOBAL_AI_SUMMIT",
                invite_code="HACK-AI",
                is_frozen=False
            )
            db.add(hack)
            db.commit()
            db.refresh(hack)
            logger.info(f"Created Hackathon: {hack.name} (Code: {hack.invite_code})")
        else:
            logger.info("Hackathon already exists.")

        # 1.5 Create Users
        if not db.query(User).filter(User.email == "judge123").first():
            db.add(User(name="Thaddeus Ross", email="judge123", password_hash=get_password_hash("password"), role="judge"))
        
        if not db.query(User).filter(User.email == "participant1").first():
            db.add(User(name="Neo Anderson", email="participant1", password_hash=get_password_hash("password"), role="participant"))

        if not db.query(User).filter(User.email == "admin").first():
            db.add(User(name="The Architect", email="admin", password_hash=get_password_hash("password"), role="admin"))
        
        db.commit()

        # 2. Create Team (Participant)
        team = db.query(Team).filter(Team.team_name == "Team Matrix").first()
        if not team:
            team = Team(
                team_name="Team Matrix",
                project_title="NeuralNet_V2",
                team_token="MATRIX_TOKEN", # Simple token
                hackathon_id=hack.id
            )
            db.add(team)
            db.commit()
            db.refresh(team)
            logger.info(f"Created Team: {team.team_name}")
        
        # 3. Create Submission
        sub = db.query(Submission).filter(Submission.team_id == team.id).first()
        if not sub:
            sub = Submission(
                team_id=team.id,
                github_url="https://github.com/neo/matrix",
                prototype_url="https://matrix.simulation",
                video_url="https://youtube.com/matrix",
                presentation_url="https://drive.google.com/file/d/matrix-ppt/view", 
                usp="A simulation indistinguishable from reality.",
                report_text="# Logic\nThe simulation is real."
            )
            db.add(sub)
            db.commit()
            logger.info("Created Submission: NeuralNet_V2")
        
    except Exception as e:
        logger.error(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
