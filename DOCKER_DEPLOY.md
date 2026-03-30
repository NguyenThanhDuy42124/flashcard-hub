# Flashcard Hub - Docker Deployment Guide for Pterodactyl

## 📋 Pre-requisites

- Python 3.11+ (or 3.14 on Pterodactyl)
- pip 25.0+
- 300MB disk space (post-cleanup)
- Node.js 18+ (for frontend build)

## 🚀 Deployment Steps

### ✨ RECOMMENDED: Direct Python with Script (2 minutes)

**For Pterodactyl servers - BEST APPROACH:**

```bash
# 1. SSH into Pterodactyl server
ssh user@your-pterodactyl-host

# 2. Clone repository
git clone https://github.com/NguyenThanhDuy42124/flashcard-hub.git
cd flashcard-hub

# 3. Make script executable (IMPORTANT!)
chmod +x deploy-pterodactyl.sh

# 4. Run deployment script - handles everything + fallbacks for errors!
./deploy-pterodactyl.sh
```

**Script automatically:**
- ✅ Updates pip (critical for Python 3.14 wheel support!)
- ✅ Clears pip cache (removes old/broken builds)
- ✅ **Forces binary-only wheels (`--only-binary :all:`)**
- ✅ Creates database
- ✅ Starts server on :8000
- ✅ **Auto-fallback if pydantic fails:** downgrades to 2.0.0 (guaranteed pre-built)

**Result:** Server runs at `http://your-host:8000` ✓

---

### If Script Fails: Manual Fallback

```bash
# 1. SSH into server
ssh user@your-pterodactyl-host
cd flashcard-hub

# 2. Clear everything
pip cache purge

# 3. Use pre-tested requirements (no Rust needed!)
pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt

# 4. Initialize database
python3 app.py --init-db

# 5. Start server (in another terminal)
python3 app.py
```

---

### Alternative: Manual Direct Python (If script fails)

```bash
# 1. SSH into server
ssh user@your-pterodactyl-host

# 2. Clone repository
git clone https://github.com/NguyenThanhDuy42124/flashcard-hub.git
cd flashcard-hub

# 3. Copy pip config to system (IMPORTANT!)
sudo cp pip.conf ~/.pip/pip.conf || cp pip.conf ~/.config/pip/pip.conf

# 4. Install with pip config enabled
pip install --prefer-binary --no-cache-dir -r requirements-prod.txt

# 5. Initialize database
python -c "from backend.database import Base, engine; Base.metadata.create_all(bind=engine)"

# 6. Start server
python app.py
```

---

### Option 1: Direct Docker Compose

```bash
# 1. SSH into Pterodactyl server
ssh user@your-pterodactyl-host

# 2. Clone repository
git clone https://github.com/NguyenThanhDuy42124/flashcard-hub.git
cd flashcard-hub

# 3. Build and start containers
docker-compose -f docker-compose.prod.yml up -d

# 4. Check status
docker-compose -f docker-compose.prod.yml ps

# 5. View logs
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Option 2: Build Images First (For Offline Deployment)

```bash
# Build images first
docker-compose -f docker-compose.prod.yml build

# Then deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Option 3: Docker Build + Manual Run

```bash
# Build backend image
docker build -f backend/Dockerfile.prod -t flashcard-hub-api .

# Build frontend image  
cd frontend
docker build -f Dockerfile.prod -t flashcard-hub-web .
cd ..

# Run containers
docker run -d --name flashcard-api -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./data/flashcard.db \
  -v $(pwd)/data:/app/data \
  -e PYTHONUNBUFFERED=1 \
  flashcard-hub-api

docker run -d --name flashcard-web -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:8000 \
  flashcard-hub-web
```

### Option 4: Direct Python (No Docker - Recommended for Pterodactyl)

```bash
# 1. Clone repository
git clone https://github.com/NguyenThanhDuy42124/flashcard-hub.git
cd flashcard-hub

# 2. Create Python virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install --prefer-binary -r requirements-prod.txt

# 4. Start backend server
python app.py

# 5. In another terminal, build and serve frontend
cd frontend
npm install
npm run build

# Serve build with simple HTTP server
npx http-server build -p 3000
```

**This is the simplest for Pterodactyl hosting!**

## 🔍 Verification

### Docker Option:
```bash
# Check backend health
curl http://localhost:8000/docs

# Check frontend
curl http://localhost:3000

# View logs
docker logs flashcard-hub-api
docker logs flashcard-hub-web

# Check container stats
docker stats
```

### Direct Python Option:
```bash
# Backend should show:
# 🚀 Starting Flashcard Hub API on 0.0.0.0:8000
# 📖 API Docs: http://0.0.0.0:8000/docs

# Check API is running
curl http://localhost:8000/docs

# Check database was created
ls -la data/flashcard.db

# Check frontend running
curl http://localhost:3000
```

## 🛑 Stop / Restart

### Docker:
```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml up -d

# View running containers
docker ps

# Stop specific container
docker stop flashcard-hub-api
```

### Direct Python:
```bash
# Press Ctrl+C in terminal running app.py

# Or kill process:
killall python  # Kill all Python processes
ps aux | grep python  # Find PID
kill -9 <PID>  # Kill specific process

# Restart
python app.py
```

## 📁 Directory Structure on Server

```
flashcard-hub/
├── backend/
│   ├── data/              ← SQLite database stored here
│   ├── uploads/           ← Uploaded HTML files
│   └── Dockerfile.prod
├── frontend/
│   ├── nginx.conf
│   └── Dockerfile.prod
└── docker-compose.prod.yml
```

## 🔧 Troubleshooting

### ❌ "Failed building wheel for pydantic-core" / "No space left on device"

**THIS IS THE MAIN ISSUE** - pip is compiling Rust (should NOT happen!)

**Why?**
- Pterodactyl has limited disk space
- pydantic 2.5+ MUST compile Rust (no pre-built wheels)
- Python 3.14 on some systems doesn't have pre-built pydantic wheels

**Instant Fix - Use our script (handles automatically):**

```bash
chmod +x deploy-pterodactyl.sh
./deploy-pterodactyl.sh  # Auto-fallback to pydantic 2.0.0
```

**Manual Fix - Step by step:**

```bash
# Step 1: Clear cache completely
pip cache purge
rm -rf ~/.cache/pip

# Step 2: Force binary wheels, NO source builds
pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt

# Step 3: If STILL fails, install pydantic 2.0.0 specifically
pip install --only-binary :all: 'pydantic==2.0.0'

# Step 4: Then other packages
pip install --only-binary :all: --no-cache-dir \
  'fastapi==0.100.0' \
  'uvicorn[standard]==0.24.0' \
  'sqlalchemy==2.0.0'
```

**Key differences:**
- `requirements-prod.txt` = flexible versions (may need compilation)
- `requirements-wheels-only.txt` = pinned versions (100% pre-built wheels)

**Pro tip:** If "No space left" appears:
```bash
# Clean Rust build cache
rm -rf ~/.cargo/registry
rm -rf ~/.rustup
pip cache purge

# Clear temp files
rm -rf /tmp/pip*
rm -rf /tmp/maturin*
```

### ❌ "Cannot connect to Docker daemon"
```bash
# Docker not installed, install it:
sudo apt-get install docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### ❌ "Port already in use"
```bash
# Find what's using the port
sudo lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
export PORT=9000 && python app.py
```

### ❌ "Database locked" error
```bash
# Reset database (WARNING: deletes all data)
rm ./data/flashcard.db

# Reinitialize
python -c "from backend.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

### ❌ "ModuleNotFoundError: No module named 'fastapi'"
```bash
# Dependencies not installed, run:
pip install --prefer-binary --no-cache-dir -r requirements-prod.txt

# Verify installation
pip list | grep fastapi
python -c "import fastapi; print(fastapi.__version__)"
```

## 📊 Performance Tips

1. **Reduce memory usage:**
   - Modify docker-compose.prod.yml:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             memory: 256M
   ```

2. **Enable auto-restart:**
   - Already set: `restart: unless-stopped`

3. **Monitor resource usage:**
   ```bash
   docker stats --no-stream
   ```

## 🔐 Security Notes

- Database backed up in `backend/data/` - copy to safe location
- Change `REACT_APP_API_URL` if accessing from different domain
- Add CORS headers if frontend and backend on different servers
- Set up firewall rules for ports 8000, 3000

## 📚 File Reference

- **app.py** - Main entry point (runs FastAPI with Uvicorn)
- **backend/main.py** - FastAPI application configuration
- **requirements-prod.txt** - Flexible version ranges (attempts compilation if needed)
- **requirements-wheels-only.txt** - PINNED versions (100% pre-built wheels, no Rust!)
- **deploy-pterodactyl.sh** - Unix/Linux deployment script with fallbacks
- **deploy-pterodactyl.bat** - Windows deployment script
- **pip.conf** - Pip configuration (enforce binary wheels)
- **backend/Dockerfile.prod** - Minimal Python image (Alpine)
- **frontend/Dockerfile.prod** - Multi-stage Node.js → Nginx
- **frontend/nginx.conf** - Nginx configuration for React routing
- **docker-compose.prod.yml** - Production compose configuration (uses app.py)

## 🆘 Need Help?

Check logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

Or check implementation files:
- Backend: [main.py](backend/main.py)
- Frontend: [App.js](frontend/src/App.js)

---

**Last Updated:** 2026-03-30
**Target Hosting:** Pterodactyl Gaming Servers
