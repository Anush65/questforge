from pydantic import BaseModel, EmailStr

class JudgeCreateRequest(BaseModel):
    name: str
    email: EmailStr
