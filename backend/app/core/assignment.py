import random

def assign_teams_to_judges(teams, judges):
    random.shuffle(teams)

    assignments = []
    per_judge = len(teams) // len(judges)

    idx = 0
    for judge in judges:
        for _ in range(per_judge):
            assignments.append({
                "judge_id": judge.id,
                "team_id": teams[idx].id
            })
            idx += 1

    return assignments
