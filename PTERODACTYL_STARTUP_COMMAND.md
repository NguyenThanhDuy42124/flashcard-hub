# Pterodactyl Startup Command for Flashcard Hub

## 🚀 Copy this command to "LỆNH KHỞI ĐỘNG" field in Pterodactyl panel:

```bash
git pull origin main 2>/dev/null || true; pip cache purge; pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt; python3 app.py
```

## 📋 Step-by-step setup in Pterodactyl panel:

1. **PHIÊN BẢN JAVA** → Select `Python 3.14`

2. **LỆNH KHỞI ĐỘNG** → Paste this:
```bash
git pull origin main 2>/dev/null || true; pip cache purge; pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt; python3 app.py
```

3. **GIT REPO ADDRESS**:
```
https://github.com/NguyenThanhDuy42124/flashcard-hub.git
```

4. **GIT BRANCH**: (leave blank or set to `main`)

5. **REQUIREMENTS FILE**:
```
requirements-wheels-only.txt
```

6. **APP PY FILE**:
```
app.py
```

7. **ADDITIONAL PYTHON PACKAGES**: (LEAVE BLANK)

---

## ✅ What this command does:

```bash
git pull origin main 2>/dev/null || true
# ↓ Pull latest code from GitHub

pip cache purge
# ↓ Clear pip cache (saves disk space)

pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt
# ↓ Install ONLY pre-built wheels (NO Rust compilation!)
#   --only-binary :all:  = Must be pre-built
#   --no-cache-dir       = Don't cache temporary files

python3 app.py
# ↓ Start FastAPI server on :8000
```

---

## 🔧 Alternative with fallback (if pydantic still fails):

If you want auto-fallback if wheels install fails, use this longer command:

```bash
git pull origin main 2>/dev/null || true; pip cache purge; pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt || (pip install --only-binary :all: 'pydantic==2.0.0' 'fastapi==0.100.0' && pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt); python3 app.py
```

---

## ⚙️ Pterodactyl Panel Settings (Full Config):

| Field | Value |
|-------|-------|
| PHIÊN BẢN JAVA | Python 3.14 |
| LỆNH KHỞI ĐỘNG | `git pull origin main 2>/dev/null \|\| true; pip cache purge; pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt; python3 app.py` |
| GIT REPO ADDRESS | `https://github.com/NguyenThanhDuy42124/flashcard-hub.git` |
| GIT BRANCH | `main` |
| REQUIREMENTS FILE | `requirements-wheels-only.txt` |
| APP PY FILE | `app.py` |
| USER UPLOADED FILES | OFF (0 = false) |
| AUTO UPDATE | OFF |
| ADDITIONAL PYTHON PACKAGES | **(EMPTY)** |
| GIT USERNAME | `NguyenThanhDuy42124` |
| GIT ACCESS TOKEN | (Your GitHub token) |
| APP ARGUMENTS | **(EMPTY)** |

---

## 🧪 Test the settings:

1. Click **"Save"** in Pterodactyl panel
2. Click **"Start server"**
3. Wait 2-3 minutes (first startup installs packages)
4. Check console for:
   ```
   🚀 Starting Flashcard Hub API on 0.0.0.0:8000
   📖 API Docs: http://0.0.0.0:8000/docs
   ```
5. If success → API running! ✅
6. Frontend will be in `frontend/build/` 

---

## ❌ Troubleshooting

**If still getting "No space left on device":**

1. SSH into server:
   ```bash
   ssh user@pterodactyl-host
   cd /home/container
   ```

2. Manually clean:
   ```bash
   rm -rf ~/.cache/pip
   rm -rf /tmp/pip*
   rm -rf ~/.cargo
   df -h  # Check disk usage
   ```

3. Try install again:
   ```bash
   pip cache purge
   pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt
   ```

4. If still failing → contact hosting support for disk upgrade

---

**Summary:**
- ✅ Use default Pterodactyl startup command
- ✅ No custom scripts needed
- ✅ Automatic git pull on every startup
- ✅ Forced binary wheels (no Rust)
- ✅ Automatic cache cleanup
