# Flashcard Hub - Deployment

## 🚀 Pterodactyl Hosting (Recommended)

### Quick Setup:

1. **Startup Command:**
   ```bash
   chmod +x startup.sh && bash startup.sh
   ```

2. **REQUIREMENTS FILE:**
   ```
   requirements-wheels-only.txt
   ```

3. **Python Version:** `Python 3.14`

4. **Auto-includes:**
   - Binary wheels only (no Rust compile) ✅
   - Cache cleanup ✅
   - Auto fallback ✅
   - Database initialization ✅

---

## 📝 What startup.sh does:

1. Cleans pip cache (saves disk)
2. Updates pip 
3. Installs with `--only-binary :all:` (NO Rust!)
4. Falls back if needed
5. Init database
6. Starts server on :8000

---

## 🐳 Docker

```bash
# Using compose
docker-compose -f docker-compose.prod.yml up -d

# Check
docker ps
docker logs flashcard-hub-api
```

---

## ✅ Success

API runs at: `http://your-host:8000/docs`

Error/Issue → check:
- Disk space: `df -h`
- Logs: Check Pterodactyl console
- Manual install: See startup.sh for commands

---

**Files:** app.py, startup.sh, requirements-wheels-only.txt
