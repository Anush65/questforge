from pydantic import BaseModel
from typing import Optional

class HackathonCreateRequest(BaseModel):
    name: str
    invite_code: Optional[str] = None
    is_frozen: bool = False
