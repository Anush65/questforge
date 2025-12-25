from pydantic import BaseModel

class TeamRegisterRequest(BaseModel):
    team_name: str
    project_title: str
    hackathon_code: str
