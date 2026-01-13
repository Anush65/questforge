# QuestForge

CodeChef Winter Vacation Project by Sarvesh, Darshan, and Anush

QuestForge is a lightweight full‑stack hackathon management platform (prototype). It pairs a FastAPI backend (SQLAlchemy models + Pydantic schemas) with a static frontend UI. The repo contains developer tooling for local development, demo data, and simple DB setup scripts.

This README gives a concise, contextual guide for developers to run, extend, and deploy the project.

**Contents**
- **Backend**: [backend/](backend) — FastAPI app, routers, SQLAlchemy models, seeding tools
- **Frontend**: [frontend/](frontend) — static HTML/CSS/JS UI mounted by the backend for demos
- **Dev tools**: `seed_data.py`, `debug_data.py`, `tools/setup_postgres.ps1`

**Tech stack**
- Backend: FastAPI, Uvicorn, SQLAlchemy, Pydantic
- DB: Postgres recommended, SQLite supported for quick dev
- Frontend: Vanilla HTML/CSS/JS (static)
- Testing: pytest

## Quick start (recommended developer flow)

Prerequisites: Python 3.10+, Git, optional Postgres for production-like testing.

1. Create a virtual environment and install backend deps

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

2. Configure environment

 - Copy `backend/.env.example` to `backend/.env` and edit `DATABASE_URL` if you want Postgres.
 - If no `DATABASE_URL` is set, the backend uses SQLite at `sqlite:///./questforge.db` by default.

3. Run the API (development)

```powershell
cd backend
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Visit the OpenAPI docs at `http://127.0.0.1:8000/docs` and the health check at `http://127.0.0.1:8000/health`.

4. Serve frontend (optional)

The backend mounts a `StaticFiles` directory for the frontend. By default the mount in `app/main.py` points to an absolute path on the original developer machine — update it to the local `frontend` folder before relying on it in your environment.

Example (recommended change inside `backend/app/main.py`):

```py
from pathlib import Path
app.mount('/static', StaticFiles(directory=str(Path(__file__).resolve().parents[2] / 'frontend'), html=True), name='static')
```

After that, the frontend will be available at `http://127.0.0.1:8000/static/main.html`.

## Project structure (high level)

- `backend/`
	- `app/main.py` — FastAPI application, router registration, DB table creation
	- `app/core/` — `database.py`, `auth.py`, helpers
	- `app/models/` — SQLAlchemy models: `hackathon`, `team`, `submission`, `judge`, `evaluation`, `user`, etc.
	- `app/routes/` — API routers grouped by domain (hackathon, team, submission, judge, assignment, evaluation, auth, leaderboard, judge_view)
	- `app/schemas/` — Pydantic request/response schemas
	- `tools/` — seeding and helper scripts

- `frontend/` — static UI: `main.html`, `style.css`, `script.js`

## Key operational details & recommendations

- Database: `backend/app/core/database.py` reads `DATABASE_URL` from environment. Defaults to `sqlite:///./questforge.db` for fast dev. For Postgres, set `DATABASE_URL` to `postgresql://user:pass@host:port/dbname`.
- Migrations: The project currently uses `Base.metadata.create_all()` to create tables. For production use, integrate Alembic for proper migrations.
- Secrets: `app/core/auth.py` contains a demo `SECRET_KEY`. Move secrets to env vars and never commit them.
- Static mounting: `app/main.py` contains an absolute path to the original frontend directory. Change it to a workspace-relative path (see example above) so the app works across machines and in containers.

## API overview (high level)

- `GET /health` — health check
- `POST /auth/register` — register user (see `app/routes/auth.py`)
- `POST /auth/login` — login and receive access token
- `GET /hackathons/` — list hackathons
- `POST /hackathons/` — create hackathon
- `POST /submissions/` — submit project (participant flow)
- Router list: See `backend/app/routes/` for full endpoints and Pydantic schemas in `backend/app/schemas/`.

## Development helpers

- `seed_data.py` and `debug_data.py` — seed the DB with demo data for local development.
- `tools/setup_postgres.ps1` — script to provision a local Postgres DB for Windows PowerShell.

## Tests

- `pytest` is included as a dependency. Add tests under a `tests/` folder and run from the repo root:

```powershell
cd backend
pytest -q
```

## Docker / deployment notes (suggested)

- Create a small `Dockerfile` for backend using `python:3.10-slim`, install `requirements.txt`, set `ENV DATABASE_URL` and run `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- Use a separate Postgres container and set `DATABASE_URL` to point to the Postgres service.

## Security & hardening (next steps)

- Replace hardcoded `SECRET_KEY` with an environment variable and rotate regularly.
- Use HTTPS in production and configure CORS tightly rather than `allow_origins=['*']`.
- Add role-based access control and ensure endpoints verify the user's role (some checks are performed in routes but review carefully).

## Contributing

- To contribute, fork the repo, create a feature branch, and open a PR with a focused description. Add tests for new behavior.

## Reference files
- Backend entry: [backend/app/main.py](backend/app/main.py)
- DB config: [backend/app/core/database.py](backend/app/core/database.py)
- Frontend entry: [frontend/main.html](frontend/main.html)
