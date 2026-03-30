#!/usr/bin/env python3
"""
Flashcard Hub - Start Script
Initializes and starts the FastAPI backend server with automatic database setup.
"""
import os
import sys
import subprocess
import platform
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

def setup_environment():
    """Setup environment variables."""
    env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        print("📝 Creating .env file with defaults...")
        with open(env_file, 'w') as f:
            f.write("HOST=0.0.0.0\n")
            f.write("PORT=8000\n")
            f.write("RELOAD=True\n")
            f.write("DATABASE_URL=sqlite:///./flashcard.db\n")

def start_backend():
    """Start the FastAPI backend server."""
    print("\n" + "="*60)
    print("🚀 Starting Flashcard Hub Backend")
    print("="*60)
    print("📖 API Docs: http://localhost:8000/docs")
    print("📊 ReDoc: http://localhost:8000/redoc")
    print("="*60 + "\n")
    
    os.chdir(str(Path(__file__).parent / "backend"))
    
    try:
        from app import app
        import uvicorn
        
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", "8000"))
        relload = os.getenv("RELOAD", "True").lower() == "true"
        
        uvicorn.run(
            "app:app",
            host=host,
            port=port,
            reload=relload,
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
    
    # Setup environment
    setup_environment()
    
    # Start backend
    start_backend()

if __name__ == "__main__":
    main()
