from sqlalchemy import Column, Integer, Float, ForeignKey, UniqueConstraint
from app.core.database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True)
    judge_id = Column(Integer, ForeignKey("judges.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    score = Column(Float, nullable=False)  # 1–10 (Allows decimals like 8.7)

    __table_args__ = (
        UniqueConstraint("judge_id", "team_id", name="unique_judge_team_eval"),
    )
