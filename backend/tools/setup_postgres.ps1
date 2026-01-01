<#
Setup Postgres DB and seed demo data for QuestForge

This script will:
- Prompt for the Postgres superuser name (default: postgres)
- Prompt for the Postgres superuser password (secure prompt)
- Create role `quest` with password `secret` if it doesn't exist
- Create database `questforge` owned by `quest` if it doesn't exist
- Run the project's demo seeder to populate the DB

Run from the `backend` folder in PowerShell:
    .\tools\setup_postgres.ps1
#>

Param()

Write-Host "This will create role 'quest' and database 'questforge' if missing, then seed demo data."

$pgSuper = Read-Host "Postgres superuser (default: postgres)"
if ([string]::IsNullOrWhiteSpace($pgSuper)) { $pgSuper = 'postgres' }

$pgPass = Read-Host -AsSecureString "Postgres superuser password"
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPass)
$UnsecurePgPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host "Creating role and database (if missing)..."

$env:PGPASSWORD = $UnsecurePgPass

$createRoleSql = @"
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'quest') THEN
       CREATE ROLE quest LOGIN PASSWORD 'secret';
   END IF;
END
$$;
"@

$createDbSql = @"
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'questforge') THEN
       CREATE DATABASE questforge OWNER quest;
   END IF;
END
$$;
"@

# Determine path to psql.exe. Try common install locations, otherwise prompt user.
$psqlCandidates = @(
    "psql",
    "C:\\Program Files\\PostgreSQL\\15\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\14\\bin\\psql.exe",
    "C:\\Program Files\\PostgreSQL\\13\\bin\\psql.exe",
    "C:\\Program Files (x86)\\PostgreSQL\\13\\bin\\psql.exe"
)

$psqlPath = $null
foreach ($cand in $psqlCandidates) {
    try {
        # Test by getting version; suppress output
        & $cand --version > $null 2>&1
        if ($LASTEXITCODE -eq 0) { $psqlPath = $cand; break }
    } catch { }
}

if (-not $psqlPath) {
    $psqlPath = Read-Host "`npsql not found in PATH. Enter full path to psql.exe (or press Enter to abort)"
    if ([string]::IsNullOrWhiteSpace($psqlPath)) { Write-Error "psql path required."; exit 1 }
}

# Run SQL using resolved psql path
& $psqlPath -U $pgSuper -c $createRoleSql
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create role 'quest'. Check credentials and psql path ($psqlPath)."; exit 1 }

& $psqlPath -U $pgSuper -c $createDbSql
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to create database 'questforge'."; exit 1 }

Remove-Item Env:\PGPASSWORD

Write-Host "Seeding demo data into Postgres..."

$env:DATABASE_URL = 'postgresql+psycopg2://quest:secret@localhost:5432/questforge'
$env:PYTHONPATH = (Resolve-Path -Path .).Path

& $env:PYTHONPATH\\.venv\\Scripts\\python.exe tools\\demo_leaderboard.py

if ($LASTEXITCODE -ne 0) { Write-Error "Seeding failed. Inspect output above."; exit 1 }

Write-Host "Done. Verify with: python tools/demo_requests.py or start the server with uvicorn."
