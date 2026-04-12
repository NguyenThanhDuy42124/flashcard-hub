"""Database configuration and connection."""
import os
import shutil
import sqlite3
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Prefer persistent SQLite path and migrate legacy DB files if needed.
project_root = Path(__file__).resolve().parent.parent
running_in_container = str(project_root).startswith("/home/container")
default_data_dir = Path("/home/container/data") if running_in_container else project_root / "data"
default_data_dir.mkdir(parents=True, exist_ok=True)

# Load optional env files (non-overriding) so users can keep DB secrets outside code.
for env_file in (
    project_root / ".env",
    project_root / ".env.mysql",
    project_root / "backend" / ".env",
    project_root / "backend" / ".env.mysql",
):
    if env_file.exists():
        load_dotenv(env_file, override=False)

db_path = Path(os.getenv("FLASHCARD_DB_PATH", str(default_data_dir / "flashcard_hub.db")))


def _build_mysql_url_from_env() -> str | None:
    """Build MySQL DATABASE_URL from split environment variables when provided."""
    endpoint = os.getenv("MYSQL_ENDPOINT", "").strip()
    host = os.getenv("MYSQL_HOST", "").strip()
    port = os.getenv("MYSQL_PORT", "").strip()

    if endpoint and not host:
        if ":" in endpoint:
            host, endpoint_port = endpoint.rsplit(":", 1)
            port = port or endpoint_port
        else:
            host = endpoint

    database = os.getenv("MYSQL_DATABASE", "").strip()
    user = os.getenv("MYSQL_USER", "").strip()
    password = os.getenv("MYSQL_PASSWORD", "").strip()

    if not (host and database and user and password):
        return None

    port = port or "3306"
    charset = os.getenv("MYSQL_CHARSET", "utf8mb4").strip() or "utf8mb4"
    return (
        f"mysql+pymysql://{quote_plus(user)}:{quote_plus(password)}"
        f"@{host}:{port}/{database}?charset={charset}"
    )


def _read_sqlite_stats(path: Path):
    """Return (decks_count, cards_count, file_size) for a SQLite file."""
    if not path.exists() or not path.is_file():
        return -1, -1, 0

    size = path.stat().st_size
    try:
        conn = sqlite3.connect(path)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='decks'")
        has_decks = (cur.fetchone() or [0])[0] == 1
        cur.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='cards'")
        has_cards = (cur.fetchone() or [0])[0] == 1

        decks_count = 0
        cards_count = 0
        if has_decks:
            cur.execute("SELECT COUNT(*) FROM decks")
            decks_count = (cur.fetchone() or [0])[0] or 0
        if has_cards:
            cur.execute("SELECT COUNT(*) FROM cards")
            cards_count = (cur.fetchone() or [0])[0] or 0

        conn.close()
        return int(decks_count), int(cards_count), int(size)
    except Exception:
        return -1, -1, int(size)


def _pick_best_sqlite_file(candidates):
    """Pick the candidate with the richest data footprint."""
    best_path = None
    best_score = (-1, -1, -1)
    for candidate in candidates:
        decks_count, cards_count, file_size = _read_sqlite_stats(candidate)
        score = (decks_count + cards_count, decks_count, file_size)
        if score > best_score:
            best_path = candidate
            best_score = score
    return best_path, best_score

# Resolve DATABASE_URL priority:
# 1) MySQL split env vars (MYSQL_ENDPOINT/HOST/PORT/USER/PASSWORD/DATABASE)
# 2) Explicit DATABASE_URL
# 3) Auto-selected local SQLite snapshot
resolved_database_url = _build_mysql_url_from_env() or os.getenv("DATABASE_URL")

if not resolved_database_url:
    legacy_paths = [
        db_path,
        project_root / "backend" / "flashcard_hub.db",
        project_root / "flashcard_hub.db",
    ]

    unique_candidates = []
    seen = set()
    for candidate in legacy_paths:
        key = str(candidate.resolve()) if candidate.exists() else str(candidate)
        if key in seen:
            continue
        seen.add(key)
        unique_candidates.append(candidate)

    best_path, best_score = _pick_best_sqlite_file(unique_candidates)
    current_score = _read_sqlite_stats(db_path)

    should_copy = (
        best_path is not None
        and best_path.exists()
        and best_path.resolve() != db_path.resolve()
        and best_score > (current_score[0] + current_score[1], current_score[0], current_score[2])
    )

    if should_copy:
        db_path.parent.mkdir(parents=True, exist_ok=True)
        if db_path.exists():
            backup_path = db_path.with_suffix(".db.bootstrap.bak")
            shutil.copy2(db_path, backup_path)
        shutil.copy2(best_path, db_path)

    resolved_database_url = f"sqlite:///{db_path}"

DATABASE_URL = resolved_database_url

# Create engine - SQLite specific settings
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=3600,
        echo=False
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """Dependency for FastAPI to inject database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
