from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"))
