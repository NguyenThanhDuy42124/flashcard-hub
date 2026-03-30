# Flashcard Hub - Docker Deployment Guide for Pterodactyl

## 📋 Pre-requisites

- Docker & Docker Compose installed on Pterodactyl
- Port 8000 & 3000 available
- 500MB disk space minimum

## 🚀 Deployment Steps

### Option 1: Direct Docker Compose (Recommended)

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
docker-compose -f docker-compose.prod.yml logs -f
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
cd backend
docker build -f Dockerfile.prod -t flashcard-hub-api .

# Build frontend image  
cd ../frontend
docker build -f Dockerfile.prod -t flashcard-hub-web .

# Run containers
docker run -d --name flashcard-api -p 8000:8000 \
  -e DATABASE_URL=sqlite:///./data/flashcard.db \
  -v $(pwd)/backend/data:/app/data \
  flashcard-hub-api

docker run -d --name flashcard-web -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:8000 \
  flashcard-hub-web
```

## 🔍 Verification

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

## 🛑 Stop / Restart

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

### "Cannot connect to Docker daemon"
```bash
# Docker not installed, install it:
sudo apt-get install docker.io docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### "Port already in use"
```bash
# Find what's using the port
sudo lsof -i :8000
sudo lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different ports
docker run -p 9000:8000 ...
```

### "Insufficient disk space"
```bash
# Clean up Docker
docker system prune -a

# Check disk usage
df -h
du -sh ./backend/data ./frontend/build
```

### "Database locked" error
```bash
# Reset database (WARNING: deletes all data)
rm ./backend/data/flashcard.db
docker-compose -f docker-compose.prod.yml restart backend
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

- **backend/Dockerfile.prod** - Minimal Python image (Alpine)
- **frontend/Dockerfile.prod** - Multi-stage Node.js → Nginx
- **frontend/nginx.conf** - Nginx configuration for React routing
- **docker-compose.prod.yml** - Production compose configuration

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
