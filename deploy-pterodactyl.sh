#!/bin/bash
# Deployment script for Pterodactyl hosting
# AGGRESSIVE MODE: Forces binary-only wheels, no compilation!

set -e

echo "🚀 Flashcard Hub - Pterodactyl Deployment"
echo "=========================================="

# Step 0: Pre-checks
echo "🔍 Checking system..."
python3 --version
pip --version

# Step 1: Clear any cached builds
echo "🧹 Clearing pip cache..."
pip cache purge 2>/dev/null || true

# Step 2: Update pip to latest (IMPORTANT for binary wheel support)
echo "📦 Updating pip..."
pip install --upgrade pip setuptools wheel

# Step 3: AGGRESSIVE: Install with ONLY binary wheels - no source builds!
echo "📥 Installing dependencies (BINARY WHEELS ONLY - NO COMPILATION)..."
pip install \
  --only-binary :all: \
  --no-cache-dir \
  --no-build-isolation \
  -r requirements-prod.txt 2>&1 | tee install.log

# If above fails, fallback to downgraded pydantic
if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Standard install failed (pydantic-core Rust compilation issue)"
  echo "🔄 Fallback 1: Trying with pre-tested wheels-only requirements..."
  pip cache purge
  pip install \
    --only-binary :all: \
    --no-cache-dir \
    -r requirements-wheels-only.txt 2>&1 | tee install-wheels.log
  
  if [ $? -ne 0 ]; then
    echo ""
    echo "🔄 Fallback 2: Installing pydantic 2.0.0 first (guaranteed pre-built)..."
    pip cache purge
    pip install --only-binary :all: --no-cache-dir 'pydantic==2.0.0' 'fastapi==0.100.0'
    
    # Then try rest of requirements
    echo "🔄 Fallback 3: Installing remaining packages..."
    pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt || true
  fi
fi

# Step 4: Verify all critical imports
echo "✅ Verifying critical imports..."
python3 << 'PYTHONEOF'
try:
    import fastapi
    import uvicorn
    import sqlalchemy
    import pydantic
    import beautifulsoup4
    print("✅ SUCCESS: All imports verified!")
    print(f"  - FastAPI: {fastapi.__version__}")
    print(f"  - Uvicorn: {uvicorn.__version__}")
    print(f"  - Pydantic: {pydantic.__version__}")
except ImportError as e:
    print(f"❌ IMPORT ERROR: {e}")
    print("⚠️  Some packages are still missing! Check install.log")
    exit(1)
PYTHONEOF

# Step 5: Create necessary directories
echo "📁 Creating directories..."
mkdir -p data
mkdir -p uploads

# Step 6: Initialize database
echo "🗄️ Initializing database..."
cd /home/container || cd .
python3 << 'PYTHONEOF'
try:
    from backend.database import Base, engine
    Base.metadata.create_all(bind=engine)
    print("✅ Database initialized successfully!")
except Exception as e:
    print(f"⚠️ Database init warning: {e}")
    print("   This may be normal if running in container")
PYTHONEOF

# Step 7: Start the server
echo ""
echo "🌐 Starting Flashcard Hub API..."
echo "📖 API Docs: http://localhost:8000/docs"
echo "📊 Swagger UI: http://localhost:8000/swagger"
echo "=========================================="
echo ""

# Export environment variables
export HOST=0.0.0.0
export PORT=8000
export RELOAD=false
export DATABASE_URL="sqlite:///./data/flashcard.db"
export PYTHONUNBUFFERED=1

# Start the server
python3 app.py

