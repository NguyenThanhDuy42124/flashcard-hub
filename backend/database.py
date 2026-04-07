"""Database configuration and connection."""
import os
import shutil
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Prefer persistent SQLite path and migrate legacy DB files if needed.
project_root = Path(__file__).resolve().parent.parent
running_in_container = str(project_root).startswith("/home/container")
default_data_dir = Path("/home/container/data") if running_in_container else project_root / "data"
default_data_dir.mkdir(parents=True, exist_ok=True)

db_path = Path(os.getenv("FLASHCARD_DB_PATH", str(default_data_dir / "flashcard_hub.db")))

if not db_path.exists():
    legacy_paths = [
        project_root / "backend" / "flashcard_hub.db",
        project_root / "flashcard_hub.db",
    ]
    for legacy_path in legacy_paths:
        if legacy_path.exists() and legacy_path.resolve() != db_path.resolve():
            db_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(legacy_path, db_path)
            break

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{db_path}"
)

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
