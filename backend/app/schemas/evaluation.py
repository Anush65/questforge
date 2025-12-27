from pydantic import BaseModel, conint

class EvaluationCreateRequest(BaseModel):
    judge_id: int
    team_id: int
    score: conint(ge=1, le=10)
