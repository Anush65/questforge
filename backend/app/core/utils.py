import random
import string
import uuid

def generate_invite_code(length=6):
    chars = string.ascii_uppercase + string.digits
    return "QF-" + "".join(random.choice(chars) for _ in range(length))

def generate_team_token():
    return str(uuid.uuid4())


def normalize_evaluations_by_judge(evaluations, target_mean=7):
    """Normalize scores per judge to a common target mean.

    Args:
        evaluations: iterable of objects/dicts with attributes/keys `judge_id`, `team_id`, `score`.
        target_mean: numeric target mean to scale judge scores to.

    Returns:
        List of dicts: {"judge_id", "team_id", "normalized_score"}.

    Notes:
        - Handles missing/null scores by skipping them in mean computation.
        - If a judge has no valid scores or mean is zero, their scores are set to `target_mean`.
    """
    # Group scores by judge
    judge_scores = {}
    for e in evaluations:
        jid = getattr(e, "judge_id", None) if not isinstance(e, dict) else e.get("judge_id")
        score = getattr(e, "score", None) if not isinstance(e, dict) else e.get("score")
        if jid is None:
            continue
        if score is None:
            continue
        judge_scores.setdefault(jid, []).append(float(score))

    # Compute per-judge mean
    judge_mean = {}
    for jid, scores in judge_scores.items():
        if len(scores) == 0:
            judge_mean[jid] = 0.0
        else:
            judge_mean[jid] = sum(scores) / len(scores)

    normalized = []
    for e in evaluations:
        jid = getattr(e, "judge_id", None) if not isinstance(e, dict) else e.get("judge_id")
        tid = getattr(e, "team_id", None) if not isinstance(e, dict) else e.get("team_id")
        score = getattr(e, "score", None) if not isinstance(e, dict) else e.get("score")

        if jid is None or tid is None or score is None:
            continue

        mean = judge_mean.get(jid, 0.0)
        if mean and mean != 0:
            normalized_score = (float(score) / mean) * float(target_mean)
        else:
            # Avoid division by zero: fallback to target_mean
            normalized_score = float(target_mean)

        normalized.append({
            "judge_id": jid,
            "team_id": tid,
            "normalized_score": normalized_score
        })

    return normalized
