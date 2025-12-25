from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class JudgeAssignment(Base):
    __tablename__ = "judge_assignments"

    id = Column(Integer, primary_key=True)
    judge_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
