#!/bin/bash
# Deployment script for Pterodactyl hosting
# Run: bash deploy-pterodactyl.sh

set -e  # Exit on error

echo "🚀 Flashcard Hub - Pterodactyl Deployment"
echo "=========================================="

# Step 1: Update pip
echo "📦 Updating pip..."
pip install --upgrade pip setuptools wheel

# Step 2: Install dependencies with pre-built wheels ONLY
echo "📥 Installing dependencies (pre-built wheels only)..."
pip install \
  --prefer-binary \
  --no-cache-dir \
  -r requirements-prod.txt

# Step 3: Verify imports
echo "✅ Verifying installations..."
python -c "
import fastapi
import uvicorn
import sqlalchemy
import pydantic
import beautifulsoup4
print('✅ All imports successful!')
"

# Step 4: Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p uploads

# Step 5: Initialize database
echo "🗄️  Initializing database..."
python -c "
from backend.database import Base, engine
Base.metadata.create_all(bind=engine)
print('✅ Database initialized!')
"

# Step 6: Start the server
echo "🌐 Starting Flashcard Hub API..."
echo "📖 API Docs: http://localhost:8000/docs"
echo "=========================================="

# Export environment variables for app.py
export HOST=0.0.0.0
export PORT=8000
export RELOAD=false
export DATABASE_URL="sqlite:///./data/flashcard.db"
export PYTHONUNBUFFERED=1

# Start FastAPI with Uvicorn
python app.py
