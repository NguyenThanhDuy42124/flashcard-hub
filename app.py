"""
Flashcard Hub – Entry point for Pterodactyl Python Egg hosting.

This script:
1. Syncs code from GitHub (git fetch + reset --hard)
2. Installs Python dependencies from requirements.txt
3. Initializes database
4. Starts the FastAPI server via uvicorn

Pterodactyl auto-installs requirements.txt, then runs this file.
"""
import subprocess
import sys
import os

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

# ── Force sync with GitHub (fixes Pterodactyl git pull conflicts) ──
project_root = os.path.dirname(os.path.abspath(__file__))
if os.path.isdir(os.path.join(project_root, ".git")):
    print("==> Syncing code from GitHub...")
    try:
        # Try git pull first
        result = subprocess.run(["git", "pull", "origin", "main"], cwd=project_root, timeout=30, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Git pull warning: {result.stderr}")
            # Fall back to fetch + reset
            subprocess.run(["git", "fetch", "origin", "main"], cwd=project_root, timeout=30, check=True)
            subprocess.run(["git", "reset", "--hard", "origin/main"], cwd=project_root, timeout=30, check=True)
        print("✅ Code synced successfully!")
        print(f"Current commit: {subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], cwd=project_root, capture_output=True, text=True).stdout.strip()}")
    except Exception as e:
        print(f"❌ Git sync failed: {e}")

# Initialize database before starting server
try:
    from database import Base, engine
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")
except Exception as e:
    print(f"⚠️  Database initialization: {e}")

# Get port from environment (Pterodactyl sets SERVER_PORT)
port = "25297"

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
subprocess.call([
    sys.executable, "-m", "uvicorn",
    "main:app",
    "--host", "0.0.0.0",
    "--port", str(port),
    "--log-config", log_config_path
])
