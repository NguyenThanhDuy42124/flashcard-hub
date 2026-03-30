# 📋 Flashcard Hub - SQLite Edition

Phiên bản cập nhật sử dụng **SQLite** thay vì MySQL và có **app.py** để khởi động server.

---

## 🎯 Những thay đổi chính

### ✨ Database: MySQL → SQLite

**Trước (MySQL):**
- ❌ Phải cài MySQL riêng biệt
- ❌ Cần kết nối với database server
- ❌ Cần chạy migrations (alembic)
- ❌ Phức tạp khi deploy

**Sau (SQLite):**
- ✅ Built-in, không cần cài đặt
- ✅ Tệp database tự động tạo
- ✅ Rất dễ backup (chỉ là file)
- ✅ Perfect cho development & small-medium deployment

### 🚀 Entry Point: app.py

**Trước:**
```bash
uvicorn main:app --reload --port 8000
```

**Sau:**
```bash
python app.py
```

Hoặc cho production:
```bash
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app
```

---

## 📁 Tệp tin được thêm/sửa

### ✅ Tệp mới

| Tệp | Mô tả |
|-----|-------|
| `app.py` | Entry point chính - khởi động server |
| `wsgi.py` | WSGI entry point cho production |
| `start.bat` | Script khởi động Windows (2-click start) |
| `start.sh` | Script khởi động Linux/Mac |
| `check.py` | System check script |
| `Procfile` | Heroku deployment config |
| `runtime.txt` | Python version cho Heroku |
| `build.sh` | Build script |
| `QUICKSTART.md` | Hướng dẫn bắt đầu nhanh |
| `DEPLOYMENT.md` | Hướng dẫn triển khai chi tiết |

### 🔧 Tệp đã sửa

| Tệp | Thay đổi |
|-----|---------|
| `backend/database.py` | SQLite config thay MySQL |
| `backend/requirements.txt` | Xóa pymysql, add gunicorn |
| `backend/main.py` | Xóa Base.metadata.create_all |
| `backend/README.md` | Cập nhật cho SQLite |
| `README.md` | Cập nhật setup instructions |
| `DEVELOPMENT.md` | Xóa MySQL setup steps |
| `.env.example` | Cập nhật cho SQLite |

---

## 🚀 Cách khởi động

### Cách 1️⃣ : Windows - 2 Click!

```
1. Double-click: start.bat
Done! ✨
```

### Cách 2️⃣ : Linux/Mac

```bash
chmod +x start.sh
./start.sh
```

### Cách 3️⃣ : Manual

```bash
# Terminal 1 - Backend
cd backend
python -m venv ../venv
../venv/Scripts/activate  # Windows
pip install -r requirements.txt
python app.py

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

---

## 🗄️ Database

### Storage

```
flashcard-hub/
└── backend/
    └── flashcard_hub.db  ← SQLite database (auto-created)
```

### Kích thước

- Khởi đầu: ~10 KB
- 1000 decks: ~1-5 MB
- Dễ backup: Copy file là xong!

### Tables

Tự động tạo khi chạy `python app.py`:
- users
- decks
- cards
- study_sessions
- card_reviews

---

## 📍 URLs

| Tên | URL |
|-----|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Health Check | http://localhost:8000/api/health |

---

## 🔍 Verifying Installation

```bash
# Check nếu mọi thứ OK
python check.py
```

Output:
```
✅ Python 3.10+
✅ Node.js installed
✅ Dependencies OK
✅ Database ready
⏳ Backend not running (expected)
⏳ Frontend not running (expected)
```

---

## 🌐 Triển khai (Deploy)

### Heroku (Recommended - Free)

```bash
heroku login
heroku create your-app
git push heroku main
```

Tự động sử dụng:
- Procfile → chạy gunicorn
- runtime.txt → Python 3.10
- requirements.txt → dependencies

### Railway / Render

- Cũng dễ dàng như Heroku
- Xem: `DEPLOYMENT.md`

### Docker

```bash
docker-compose up
```

### VPS (AWS, DigitalOcean, etc.)

```bash
# Cài Python, Node, Git
# Clone repo
# make venv + pip install
# npm install + npm build
# gunicorn wsgi:app
```

Xem chi tiết: `DEPLOYMENT.md`

---

## 🔧 Configuration

### Environment Variables

```bash
# .env (create from .env.example)
DATABASE_URL=sqlite:///./flashcard_hub.db
DEBUG=True
SECRET_KEY=your-key
HOST=0.0.0.0
PORT=8000
```

### CORS (Frontend URL)

Edit `main.py`:
```python
allow_origins=["http://localhost:3000", "https://your-domain.com"]
```

---

## 📊 Quick Comparison

| Feature | MySQL | SQLite |
|---------|-------|--------|
| Setup | ❌ Complex | ✅ None |
| File | Remote | Local |
| Dev Env | ⚠️ Hard | ✅ Easy |
| Deploy | ⚠️ Hard | ✅ Easy |
| Performance | ⚡ Fast (many connections) | ⚡ Fast (local) |
| Scalability | ✅ Large | ✅ Medium |
| Portability | ❌ Server-based | ✅ File-based |

---

## 📚 Tài liệu

- **QUICKSTART.md** - Bắt đầu trong 5 phút
- **DEVELOPMENT.md** - Phát triển locally
- **DEPLOYMENT.md** - Deploy lên server
- **backend/README.md** - Backend docs
- **frontend/README.md** - Frontend docs

---

## ✅ Checklist

- [x] SQLite database setup
- [x] app.py entry point
- [x] Windows/Linux/Mac start scripts
- [x] Production deployment ready (Heroku/Docker)
- [x] System check script
- [x] Comprehensive documentation
- [x] QUICKSTART guide
- [x] DEPLOYMENT guide

---

## 🎁 Bonus

### 1. System Check
```bash
python check.py
```

### 2. One-Click Start (Windows)
```
start.bat
```

### 3. Documentation in Vietnamese
```
QUICKSTART.md
DEPLOYMENT.md (Tiếng Việt sections)
```

### 4. Multiple Deployment Options
- Heroku
- Railway
- Render
- Docker
- VPS

---

## 🚀 Bạn đã sẵn sàng!

1. Chạy: `start.bat` (Windows) hoặc `./start.sh` (Linux/Mac)
2. Mở: http://localhost:3000
3. Bắt đầu học! 📚

---

**Enjoy! Happy Learning! 🎉**
