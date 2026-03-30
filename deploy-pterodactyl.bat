@echo off
REM Deployment script for Pterodactyl hosting (Windows)
REM Run: deploy-pterodactyl.bat

echo.
echo Flashcard Hub - Pterodactyl Deployment
echo ========================================

REM Step 1: Update pip
echo.
echo Updating pip...
python -m pip install --upgrade pip setuptools wheel

REM Step 2: Install dependencies with pre-built wheels
echo.
echo Installing dependencies ^(pre-built wheels only^)...
pip install ^
  --prefer-binary ^
  --no-cache-dir ^
  -r requirements-prod.txt

REM Step 3: Verify imports
echo.
echo Verifying installations...
python -c "import fastapi, uvicorn, sqlalchemy, pydantic, beautifulsoup4; print('✅ All imports successful!')"

REM Step 4: Create directories
echo.
echo Creating directories...
if not exist data mkdir data
if not exist uploads mkdir uploads

REM Step 5: Initialize database
echo.
echo Initializing database...
python -c "from backend.database import Base, engine; Base.metadata.create_all(bind=engine); print('✅ Database initialized!')"

REM Step 6: Start server
echo.
echo Starting Flashcard Hub API...
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.

set HOST=0.0.0.0
set PORT=8000
set RELOAD=false
set DATABASE_URL=sqlite:///./data/flashcard.db
set PYTHONUNBUFFERED=1

python app.py
