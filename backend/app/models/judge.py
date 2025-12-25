from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Judge(Base):
    __tablename__ = "judges"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
