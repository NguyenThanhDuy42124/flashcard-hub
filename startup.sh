#!/bin/bash
# Flashcard Hub - Pterodactyl Startup (No Rust Compilation!)

set -e

echo "🚀 Flashcard Hub Startup"
echo "========================"

# Print Python version
python3 --version

# Clean cache aggressively
echo "🧹 Cleaning pip cache..."
pip cache purge || true
rm -rf ~/.cache/pip 2>/dev/null || true
rm -rf /tmp/pip* 2>/dev/null || true

# UPDATE pip
echo "📦 Updating pip..."
pip install --upgrade pip

# INSTALL ONLY BINARY WHEELS - NO RUST!
echo "📥 Installing dependencies (binary wheels only)..."
if pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt; then
  echo "✅ SUCCESS: All packages installed!"
else
  echo "⚠️ FALLBACK: Trying minimal install..."
  pip cache purge
  pip install --only-binary :all: --no-cache-dir pydantic==2.0.0 fastapi==0.100.0 uvicorn 2>&1 || true
fi

# Verify imports
echo "✅ Verifying imports..."
python3 -c "import fastapi; print('FastAPI OK')" || exit 1

# Init database
echo "🗄️ Initializing database..."
python3 -c "
from backend.database import Base, engine
try:
    Base.metadata.create_all(bind=engine)
    print('✅ Database ready')
except Exception as e:
    print(f'⚠️ DB init: {e}')
" || true

# START SERVER
echo ""
echo "🌐 Starting API on :8000"
echo "📖 Docs: http://localhost:8000/docs"
echo "========================"
python3 app.py
