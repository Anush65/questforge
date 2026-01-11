from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.database import Base

class Judge(Base):
    __tablename__ = "judges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
