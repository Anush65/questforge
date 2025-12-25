from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True)
    team_name = Column(String, nullable=False)
    project_title = Column(String, nullable=False)
    team_token = Column(String, unique=True, nullable=False)
    hackathon_id = Column(Integer, ForeignKey("hackathons.id"))
