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


if __name__ == "__main__":
    import uvicorn
    
    # Initialize database first
    init_db()
    
    # Get configuration from environment (Pterodactyl sets SERVER_PORT)
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT") or os.getenv("PORT") or "8000")
    
    print(f"🚀 Starting Flashcard Hub API on {host}:{port}")
    print(f"📖 API Docs: http://{host}:{port}/docs")
    print(f"🌐 Frontend: http://{host}:{port}/")
    
    # Start uvicorn server
    uvicorn.run(
        app,
        host=host,
        port=port,
        log_level="info"
    )
