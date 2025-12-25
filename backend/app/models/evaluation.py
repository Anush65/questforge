from sqlalchemy import Column, Integer, ForeignKey
from app.core.database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True)
    judge_id = Column(Integer, ForeignKey("users.id"))
    team_id = Column(Integer, ForeignKey("teams.id"))
    score = Column(Integer, nullable=False)  # 1–10
    feedback = Column(String)
