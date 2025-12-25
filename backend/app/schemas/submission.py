from pydantic import BaseModel, HttpUrl
from typing import Optional

class SubmissionCreateRequest(BaseModel):
    team_token: str
    github_url: HttpUrl
    prototype_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = None
    report_text: Optional[str] = None
