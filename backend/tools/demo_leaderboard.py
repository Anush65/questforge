import os
# Use a local demo DB only if DATABASE_URL is not already set
os.environ.setdefault('DATABASE_URL', 'sqlite:///./demo.db')

from app.core.database import Base, engine, SessionLocal
from app.models.judge import Judge
from app.models.team import Team
from app.models.evaluation import Evaluation
from app.models.judge_assignment import JudgeAssignment
# Ensure all model modules are imported so metadata has every table (FK resolution)
import app.models.hackathon
import app.models.user
import app.models.team_member
import app.models.submission
from app.core.assignment import assign_teams_to_judges
from app.core.utils import normalize_evaluations_by_judge, generate_team_token
from sqlalchemy import func

# Remove old demo DB if present
if os.path.exists('demo.db'):
    os.remove('demo.db')

Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Seed judges
judges = [Judge(name='Alice', email='alice@example.com'),
          Judge(name='Bob', email='bob@example.com'),
          Judge(name='Carol', email='carol@example.com')]
for j in judges:
    db.add(j)
db.commit()
for j in judges:
    db.refresh(j)

# Seed teams (provide required fields)
teams = []
for i in range(1, 7):
    t = Team(team_name=f'Team {i}', project_title=f'Project {i}', team_token=generate_team_token())
    teams.append(t)
    db.add(t)

db.commit()
for t in teams:
    db.refresh(t)

# Assign teams to judges
assignments = assign_teams_to_judges(teams, judges)
for a in assignments:
    db.add(JudgeAssignment(judge_id=a['judge_id'], team_id=a['team_id']))

db.commit()

# Seed evaluations with deliberate judge bias
# Alice (generous), Bob (harsh), Carol (middle)
scores_by_judge = {
    judges[0].id: [9, 8, 9, 10],
    judges[1].id: [4, 5],
    judges[2].id: [7, 6]
}

# For each assigned team, create one evaluation from its assigned judge
for a in assignments:
    jid = a['judge_id']
    tid = a['team_id']
    lst = scores_by_judge.get(jid, [7])
    score = lst.pop(0) if lst else 7
    db.add(Evaluation(judge_id=jid, team_id=tid, score=score))

db.commit()

# Raw leaderboard (SQL AVG)
raw = (
    db.query(Team.team_name, func.avg(Evaluation.score).label('avg_score'))
    .join(Evaluation, Team.id == Evaluation.team_id)
    .group_by(Team.id)
    .order_by(func.avg(Evaluation.score).desc())
    .all()
)

print('Raw leaderboard:')
for r in raw:
    print(r.team_name, float(r.avg_score))

# Normalized leaderboard
evaluations = db.query(Evaluation).all()
normalized = normalize_evaluations_by_judge(evaluations, target_mean=7)

# Aggregate normalized scores per team
team_sums = {}
team_counts = {}
for e in normalized:
    tid = e['team_id']
    team_sums[tid] = team_sums.get(tid, 0.0) + e['normalized_score']
    team_counts[tid] = team_counts.get(tid, 0) + 1

norm_results = []
for tid, total in team_sums.items():
    avg = total / team_counts[tid]
    team = db.query(Team).filter(Team.id == tid).first()
    norm_results.append((team.team_name, avg))
norm_results.sort(key=lambda x: x[1], reverse=True)

print('\nNormalized leaderboard (target_mean=7):')
for r in norm_results:
    print(r[0], round(r[1], 2))

db.close()
