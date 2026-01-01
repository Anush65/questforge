import os
# Respect existing DATABASE_URL (e.g., for Postgres); default to sqlite demo.db
os.environ.setdefault('DATABASE_URL', 'sqlite:///./demo.db')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print('GET /health')
r = client.get('/health')
print(r.status_code, r.json())

print('\nGET /leaderboard')
r = client.get('/leaderboard')
print(r.status_code, r.json())
