from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    github_url = Column(String, nullable=False)
    demo_url = Column(String)
    video_url = Column(String)
    report_text = Column(String)
