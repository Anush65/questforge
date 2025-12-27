def assign_teams_to_judges(teams, judges):
    """Deterministically assign all teams to judges.

    - Distribute teams so each judge gets either floor(n/m) or
      ceil(n/m) teams where n=len(teams) and m=len(judges).
    - Difference between any two judges is at most 1.
    - Deterministic: no randomness; preserves input order.
    - Handles edge cases: no judges or no teams.
    """
    assignments = []

    num_teams = len(teams)
    num_judges = len(judges)

    if num_judges == 0 or num_teams == 0:
        return assignments

    base = num_teams // num_judges
    remainder = num_teams % num_judges

    idx = 0
    for j_idx, judge in enumerate(judges):
        # first `remainder` judges receive one extra team
        count = base + (1 if j_idx < remainder else 0)
        for _ in range(count):
            assignments.append({
                "judge_id": judge.id,
                "team_id": teams[idx].id
            })
            idx += 1

    return assignments
