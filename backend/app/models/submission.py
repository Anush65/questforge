from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.core.database import Base

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)

    github_url = Column(String, nullable=False)
    prototype_url = Column(String)   # optional deployed link
    video_url = Column(String)        # optional demo video
    presentation_url = Column(String) # PDF link
    usp = Column(String)             # Unique Selling Point
    report_text = Column(String)

    __table_args__ = (
        UniqueConstraint("team_id", name="unique_submission_per_team"),
    )
