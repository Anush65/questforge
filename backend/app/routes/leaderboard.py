from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.core.utils import normalize_evaluations_by_judge
from app.core.db_helpers import fetchall

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def leaderboard(db: Session = Depends(get_db)):
    # Fetch raw evaluations via SQL to decouple from ORM objects
    eval_rows = fetchall("SELECT judge_id, team_id, score FROM evaluations")

    normalized = normalize_evaluations_by_judge(eval_rows, target_mean=7)

    # Aggregate normalized scores per team
    team_sums = {}
    team_counts = {}
    for e in normalized:
        tid = e["team_id"]
        score = e["normalized_score"]
        team_sums[tid] = team_sums.get(tid, 0.0) + score
        team_counts[tid] = team_counts.get(tid, 0) + 1

    # Resolve team names in one query
    team_ids = list(team_sums.keys())
    results = []
    if team_ids:
        placeholder = ",".join(str(int(t)) for t in team_ids)
        teams = fetchall(f"SELECT id, team_name FROM teams WHERE id IN ({placeholder})")
        name_map = {t["id"]: t["team_name"] for t in teams}

        for tid, total in team_sums.items():
            count = team_counts.get(tid, 1)
            avg = total / count if count else 0.0
            name = name_map.get(tid)
            if name:
                results.append((name, avg))

    # Order by avg_score desc
    results.sort(key=lambda x: x[1], reverse=True)

    return results
