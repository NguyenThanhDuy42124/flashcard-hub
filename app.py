"""
Application entry point for Flashcard Hub API.
Handles database initialization and server startup.
This file serves as the root-level entry point for the backend.
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from main import app
from database import Base, engine


def init_db():
    """Initialize database tables on startup."""
    # Create all tables from models
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully")


def create_app():
    """Create and configure the application."""
    init_db()
    return app


# Initialize app
app = create_app()


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("RELOAD", "True").lower() == "true"
    
    print(f"🚀 Starting Flashcard Hub API on {host}:{port}")
    print(f"📖 API Docs: http://{host}:{port}/docs")
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )
