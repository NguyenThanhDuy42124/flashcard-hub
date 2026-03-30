# Flashcard Hub - Deployment

## 🚀 Pterodactyl Hosting

### Setup (3 steps):

1. **REQUIREMENTS FILE:** `requirements-wheels-only.txt`
2. **APP PY FILE:** `app.py`  
3. **PYTHON:** Python 3.14

→ Pterodactyl tự động install + chạy `python app.py`

Done! 🎉

---

## ✅ API running at:
- Docs: `http://your-host:8000/docs`
- API: `http://your-host:8000`

---

## 🐳 Docker (Alternative)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📁 Files

- `app.py` - Entry point (automatically runs)
- `requirements-wheels-only.txt` - Pre-built wheels (no Rust compile)
- `backend/` - FastAPI backend
- `frontend/build/` - React production build
