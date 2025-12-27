from pydantic import BaseModel

class HackathonCreateRequest(BaseModel):
    name: str
