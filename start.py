#!/usr/bin/env python3
"""
Flashcard Hub - Start Script
Initializes and starts the FastAPI backend server with automatic database setup.
"""
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

def check_dependencies():
    """Check if all required packages are installed."""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def start_backend():
    """Start the FastAPI backend server."""
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT") or os.getenv("PORT", "8000"))

    print("\n" + "="*60)
    print("🚀 Starting Flashcard Hub Backend")
    print("="*60)
    print(f"📖 API Docs: http://localhost:{port}/docs")
    print(f"📊 ReDoc: http://localhost:{port}/redoc")
    print("="*60 + "\n")
    
    os.chdir(str(Path(__file__).parent / "backend"))
    
    try:
        import uvicorn

        reload_enabled = os.getenv("RELOAD", "False").lower() == "true"

        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload_enabled,
            log_level="info"
        )
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

def main():
    """Main entry point."""
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)

    # Start backend
    start_backend()

if __name__ == "__main__":
    main()
