import hashlib
import hmac
import os
import secrets
import sqlite3
import time
from typing import Any, Dict, Optional, Tuple

from fastapi import Header, HTTPException


DB_PATH = os.getenv(
    "AUTH_DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "auth.db"),
)

TOKEN_TTL_SECONDS = int(os.getenv("AUTH_TOKEN_TTL_SECONDS", "604800"))  # 7 days


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _now() -> int:
    return int(time.time())


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _hash_password(password: str, salt_hex: Optional[str] = None) -> str:
    if salt_hex is None:
        salt = os.urandom(16)
    else:
        salt = bytes.fromhex(salt_hex)
    derived = hashlib.scrypt(password.encode("utf-8"), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{derived.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_hex, expected_hex = stored_hash.split(":", 1)
        computed = _hash_password(password, salt_hex).split(":", 1)[1]
        return hmac.compare_digest(computed, expected_hex)
    except Exception:
        return False


def _sanitize_user(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "plan": row["plan"],
        "is_active": bool(row["is_active"]),
    }


def init_auth_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = _connect()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                plan TEXT NOT NULL DEFAULT 'pro',
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)"
        )
        conn.commit()
        _seed_default_user_if_empty(conn)
    finally:
        conn.close()


def _seed_default_user_if_empty(conn: sqlite3.Connection) -> None:
    existing_count = conn.execute("SELECT COUNT(1) AS c FROM users").fetchone()["c"]
    if existing_count > 0:
        return

    username = os.getenv("DEFAULT_ADMIN_USERNAME", "ivanesteva")
    password = os.getenv("DEFAULT_ADMIN_PASSWORD", "ivanesteva")
    email = os.getenv("DEFAULT_ADMIN_EMAIL")
    plan = os.getenv("DEFAULT_ADMIN_PLAN", "pro")

    conn.execute(
        """
        INSERT INTO users (username, email, password_hash, plan, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, ?)
        """,
        (username, email, _hash_password(password), plan, _now()),
    )
    conn.commit()


def register_user(username: str, email: Optional[str], password: str) -> Dict[str, Any]:
    username = username.strip().lower()
    email = email.strip().lower() if email else None

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must have at least 3 characters")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must have at least 8 characters")

    conn = _connect()
    try:
        existing = conn.execute(
            "SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)",
            (username, email),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="User already exists")

        conn.execute(
            """
            INSERT INTO users (username, email, password_hash, plan, is_active, created_at)
            VALUES (?, ?, ?, 'pro', 1, ?)
            """,
            (username, email, _hash_password(password), _now()),
        )
        conn.commit()
        row = conn.execute(
            "SELECT id, username, email, plan, is_active FROM users WHERE username = ?",
            (username,),
        ).fetchone()
        return _sanitize_user(row)
    finally:
        conn.close()


def authenticate_user(username: str, password: str) -> Dict[str, Any]:
    normalized = username.strip().lower()
    conn = _connect()
    try:
        row = conn.execute(
            """
            SELECT id, username, email, password_hash, plan, is_active
            FROM users
            WHERE username = ? OR email = ?
            """,
            (normalized, normalized),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if not bool(row["is_active"]):
            raise HTTPException(status_code=403, detail="User is inactive")
        if not _verify_password(password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {
            "id": row["id"],
            "username": row["username"],
            "email": row["email"],
            "plan": row["plan"],
            "is_active": bool(row["is_active"]),
        }
    finally:
        conn.close()


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(48)
    token_hash = _hash_token(token)
    now = _now()
    expires_at = now + TOKEN_TTL_SECONDS

    conn = _connect()
    try:
        conn.execute(
            """
            INSERT INTO sessions (user_id, token_hash, expires_at, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (user_id, token_hash, expires_at, now),
        )
        conn.commit()
    finally:
        conn.close()

    return token


def revoke_session_by_token(token: str) -> None:
    token_hash = _hash_token(token)
    conn = _connect()
    try:
        conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
        conn.commit()
    finally:
        conn.close()


def get_user_by_token(token: str) -> Dict[str, Any]:
    token_hash = _hash_token(token)
    now = _now()

    conn = _connect()
    try:
        row = conn.execute(
            """
            SELECT u.id, u.username, u.email, u.plan, u.is_active, s.expires_at
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token_hash = ?
            """,
            (token_hash,),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="Invalid session")
        if row["expires_at"] < now:
            conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
            conn.commit()
            raise HTTPException(status_code=401, detail="Session expired")
        if not bool(row["is_active"]):
            raise HTTPException(status_code=403, detail="User is inactive")
        return _sanitize_user(row)
    finally:
        conn.close()


def parse_bearer_token(authorization: Optional[str]) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1].strip():
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return parts[1].strip()


def get_current_user(authorization: Optional[str] = Header(default=None)) -> Dict[str, Any]:
    token = parse_bearer_token(authorization)
    return get_user_by_token(token)


def login(username: str, password: str) -> Tuple[Dict[str, Any], str]:
    user = authenticate_user(username, password)
    token = create_session(user["id"])
    return user, token
