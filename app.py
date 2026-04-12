"""
Flashcard Hub – Entry point for Pterodactyl Python Egg hosting.

This script:
1. Optionally syncs code from GitHub (opt-in)
2. Installs Python dependencies from requirements.txt
3. Initializes database
4. Starts the FastAPI server via uvicorn

Pterodactyl auto-installs requirements.txt, then runs this file.
"""
import subprocess
import sys
import os
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

project_root = os.path.dirname(os.path.abspath(__file__))


def _should_sync_code() -> bool:
    """Enable in-app git sync only when explicitly requested by environment."""
    raw = os.getenv("AUTO_UPDATE_IN_APP", "0").strip().lower()
    return raw in {"1", "true", "yes", "on"}


if os.path.isdir(os.path.join(project_root, ".git")) and _should_sync_code():
    print("==> Syncing code from GitHub (AUTO_UPDATE_IN_APP=1)...")
    try:
        subprocess.run(["git", "pull", "--ff-only", "origin", "main"], cwd=project_root, timeout=30, check=True)
        print("✅ Code synced successfully!")
        print(
            "Current commit: "
            f"{subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=project_root, capture_output=True, text=True).stdout.strip()}"
        )
    except Exception as e:
        print(f"❌ Git sync failed: {e}")
else:
    print("ℹ️ Skip in-app git sync (managed by panel or AUTO_UPDATE_IN_APP=0)")

# Initialize database before starting server
try:
    import models  # noqa: F401
    from database import Base, engine, DATABASE_URL
    from sqlalchemy import text
    Base.metadata.create_all(bind=engine)
    print(f"📁 DATABASE_URL: {DATABASE_URL}")

    if DATABASE_URL.startswith("sqlite:///"):
        sqlite_path = DATABASE_URL.replace("sqlite:///", "", 1)
        db_file = Path(sqlite_path)
        if db_file.exists():
            print(f"📦 SQLite file: {db_file} ({db_file.stat().st_size} bytes)")
        else:
            print(f"⚠️ SQLite file not found at: {db_file}")

    try:
        with engine.connect() as conn:
            deck_count = conn.execute(text("SELECT COUNT(*) FROM decks")).scalar() or 0
            card_count = conn.execute(text("SELECT COUNT(*) FROM cards")).scalar() or 0
            print(f"📊 DB snapshot: decks={deck_count}, cards={card_count}")
    except Exception as count_error:
        print(f"⚠️ Cannot read DB snapshot yet: {count_error}")

    print("✅ Database initialized successfully")
except Exception as e:
    print(f"⚠️  Database initialization: {e}")

# Get port from environment (Pterodactyl sets SERVER_PORT)
port = str(os.getenv("SERVER_PORT") or os.getenv("PORT") or "8000")

# Change to backend directory for proper imports
os.chdir(os.path.join(project_root, "backend"))

import json

# Create custom uvicorn log config
log_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "access": {
            "()": "uvicorn.logging.AccessFormatter",
            "fmt": "%(asctime)s %(levelname)s uvicorn.access: %(client_addr)s - \"%(request_line)s\" %(status_code)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
            "use_colors": False
        },
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(asctime)s %(levelname)s uvicorn.error: %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
            "use_colors": False
        },
    },
    "handlers": {
        "access": {
            "formatter": "access",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout"
        },
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr"
        }
    },
    "loggers": {
        "uvicorn": {"handlers": ["default"], "level": "INFO"},
        "uvicorn.error": {"level": "INFO"},
        "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
    }
}

log_config_path = os.path.join(project_root, "backend", "log_config.json")
with open(log_config_path, "w") as f:
    json.dump(log_config, f)

# Start FastAPI server
print(f"🚀 Starting Flashcard Hub API on port {port}...")
exit_code = subprocess.call([
    sys.executable, "-m", "uvicorn",
    "main:app",
    "--host", "0.0.0.0",
    "--port", str(port),
    "--log-config", log_config_path
])
sys.exit(exit_code)
