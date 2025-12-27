from typing import Any, Dict, Iterable, List, Optional
from sqlalchemy import text
from app.core.database import engine


def fetchall(sql: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Execute a SELECT and return list of dict rows.

    Args:
        sql: SQL query string, may contain named params like :name
        params: dict of parameters

    Returns:
        List of rows as dictionaries.
    """
    with engine.connect() as conn:
        result = conn.execute(text(sql), params or {})
        return [dict(r) for r in result.mappings().all()]


def fetchone(sql: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Execute a SELECT and return a single row as dict or None."""
    with engine.connect() as conn:
        result = conn.execute(text(sql), params or {})
        row = result.mappings().first()
        return dict(row) if row is not None else None


def execute(sql: str, params: Optional[Dict[str, Any]] = None) -> None:
    """Execute a write (INSERT/UPDATE/DELETE). Commits the transaction."""
    with engine.begin() as conn:
        conn.execute(text(sql), params or {})
