from pydantic import BaseModel
from typing import Optional

class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: str # 'judge', 'participant', 'admin'
    name: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str
    name: str
