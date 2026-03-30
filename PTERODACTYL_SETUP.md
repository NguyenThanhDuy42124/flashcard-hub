# Pterodactyl Panel Configuration Guide

## 🎮 Pterodactyl Settings for Flashcard Hub

### ⚠️ IMPORTANT: Do NOT use "ADDITIONAL PYTHON PACKAGES" field alone!

**Why?** Pterodactyl doesn't pass `--only-binary` flag → pydantic-core still compiles Rust → fails with "No space left"

---

## ✅ RECOMMENDED APPROACH: Startup Command

### Step 1: Set APP PY FILE
```
app.py
```

### Step 2: Set STARTUP COMMAND (LỆNH KHỞI ĐỘNG) in Pterodactyl panel

**Copy this exact command:**
```bash
git pull origin main 2>/dev/null || true; pip cache purge; pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt; python3 app.py
```

**This ensures:**
- ✅ Git pulls latest code
- ✅ Cache cleared (saves disk space)
- ✅ Binary wheels ONLY (no Rust compile)
- ✅ No cache dir (more disk savings)
- ✅ Uses requirements-wheels-only.txt (pydantic 2.0.0)
- ✅ Starts app.py

**See:** [PTERODACTYL_STARTUP_COMMAND.md](PTERODACTYL_STARTUP_COMMAND.md) for detailed breakdown

---

## Alternative: Use Pre-Built Script

### Step 1: Upload to server
```bash
# Upload deploy-pterodactyl.sh to root directory
scp deploy-pterodactyl.sh user@pterodactyl-host:~/
```

### Step 2: Set STARTUP COMMAND in panel
```bash
bash deploy-pterodactyl.sh
```

**Advantage:** Auto-fallbacks if first method fails

---

## 🔧 Pterodactyl Panel Fields - Correct Configuration

| Field | Value |
|-------|-------|
| **GIT REPO ADDRESS** | `https://github.com/NguyenThanhDuy42124/flashcard-hub.git` |
| **GIT BRANCH** | `main` (or blank for default) |
| **APP PY FILE** | `app.py` |
| **REQUIREMENTS FILE** | `requirements-wheels-only.txt` ⚠️ (NOT requirements.txt!) |
| **GIT USERNAME** | `NguyenThanhDuy42124` |
| **GIT ACCESS TOKEN** | (Your GitHub token) |
| **ADDITIONAL PYTHON PACKAGES** | ❌ **LEAVE BLANK** |
| **APP ARGUMENTS** | (Leave blank) |

**STARTUP COMMAND (Most Important!):**
```bash
pip cache purge && pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt && python3 app.py
```

---

## 📋 Troubleshooting in Pterodactyl

### ❌ Still getting "No space left on device"?

**In Pterodactyl Pre-startup Script:**
```bash
#!/bin/bash
set -e

# Aggressive cleanup
rm -rf ~/.cache/pip 2>/dev/null || true
rm -rf /tmp/pip* 2>/dev/null || true
pip cache purge || true

# Verify pip config
pip --version

# Install with maximum disk savings
pip install \
  --only-binary :all: \
  --no-cache-dir \
  --no-build-isolation \
  -r requirements-wheels-only.txt

# Verify
python3 -c "import fastapi; print('✅ Import successful')"
```

### ❌ "Rust not found" error still?

**Try fallback packages in POST-INSTALL script:**
```bash
#!/bin/bash
# If main install failed, try minimal set
pip install --only-binary :all: 'pydantic==2.0.0' || true
pip install --only-binary :all: 'fastapi==0.100.0' || true
python3 app.py
```

---

## 📊 Why requirements-wheels-only.txt?

| File | pydantic | Rust? | Notes |
|------|----------|-------|-------|
| requirements-prod.txt | >=2.0.0 | ⚠️ Maybe | Flexible versions, might need compile |
| **requirements-wheels-only.txt** | ==2.0.0 | ✅ NO | Pinned to pre-built wheels |

**Example difference:**
```bash
# ❌ This might compile Rust
pip install 'pydantic>=2.0.0'

# ✅ This WILL NOT compile (guaranteed pre-built)
pip install 'pydantic==2.0.0'
```

---

## 🎯 Quick Setup Checklist

- [ ] Clone repo: `git clone https://github.com/NguyenThanhDuy42124/flashcard-hub.git`
- [ ] Update Pterodactyl panel with settings above
- [ ] Set REQUIREMENTS FILE to: `requirements-wheels-only.txt`
- [ ] Set STARTUP COMMAND (see above)
- [ ] Ensure ADDITIONAL PYTHON PACKAGES is **BLANK**
- [ ] Save settings
- [ ] Start server from panel
- [ ] Wait 2-3 minutes for first startup (installing packages)
- [ ] Check console for "API Docs: http://..."

---

## 📞 If STILL failing

**Debug steps:**
1. SSH into server
2. Run manually:
   ```bash
   cd /home/container
   pip cache purge
   pip install --only-binary :all: --no-cache-dir -r requirements-wheels-only.txt
   python3 app.py
   ```
3. If error → check disk space: `df -h`
4. If "No space" → need hosting upgrade or remove old files

---

**Last updated:** 2026-03-30
**For:** Pterodactyl Hosting with Python 3.14
