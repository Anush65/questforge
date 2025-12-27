from sqlalchemy import Column, Integer, String, Boolean
from app.core.database import Base

class Hackathon(Base):
    __tablename__ = "hackathons"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    invite_code = Column(String, unique=True, nullable=False)
    is_frozen = Column(Boolean, default=False)
