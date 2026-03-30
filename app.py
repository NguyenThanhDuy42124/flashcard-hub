"""
Pterodactyl entry point for Flashcard Hub API.
Auto-syncs from GitHub, initializes database, and starts FastAPI server.
"""
import os
import sys
import subprocess
from pathlib import Path

# Add backend to path for imports
backend_path = str(Path(__file__).parent / "backend")
sys.path.insert(0, backend_path)

# ── Force sync with GitHub (handles git conflicts in Pterodactyl) ──
project_root = Path(__file__).parent
if (project_root / ".git").is_dir():
    print("==> Syncing code from GitHub...")
    try:
        subprocess.run(["git", "fetch", "origin"], cwd=project_root, timeout=30, check=False)
        subprocess.run(["git", "reset", "--hard", "origin/main"], cwd=project_root, timeout=30, check=False)
        print("✅ Code synced successfully!")
    except Exception as e:
        print(f"⚠️  Git sync skipped: {e}")

# Import after git sync
from main import app
from database import Base, engine


def init_db():
    """Initialize database tables on startup."""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization error: {e}")


# Initialize database first
init_db()

# Get port from environment variable (Pterodactyl sets SERVER_PORT or PORT)
port = os.environ.get("SERVER_PORT") or os.environ.get("PORT") or "8000"
host = os.environ.get("HOST") or "0.0.0.0"

print(f"🚀 Starting Flashcard Hub API on {host}:{port}")
print(f"📖 API Docs: http://{host}:{port}/docs")
print(f"🌐 Frontend: http://{host}:{port}/")

# Start FastAPI server via uvicorn
os.chdir(str(Path(__file__).parent / "backend"))
subprocess.call([
    sys.executable, "-m", "uvicorn",
    "main:app",
    "--host", host,
    "--port", str(port)
    )
