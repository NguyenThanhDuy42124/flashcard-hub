# Flashcard Hub - Deployment

## 🚀 Pterodactyl Hosting

### ⭐ Simple Setup (3 fields):

1. **PYTHON VERSION:** `Python 3.12` ← **Important!**
   - Python 3.14 too new → no pre-built wheels → compile Rust
   - Python 3.12 has all pre-built wheels! ✅

2. **REQUIREMENTS FILE:** `requirements.txt`

3. **APP PY FILE:** `app.py`

→ Click **Save** → Click **Start**

Done! 🎉

---

## ✅ API running at:
- Docs: `http://your-host:8000/docs`

---

## 📁 Key Files

- `app.py` - Entry point
- `requirements.txt` - Dependencies (all pinned for Python 3.12)
- `backend/main.py` - FastAPI app
