# 🎉 FLASHCARD HUB - SQLITE EDITION

## ⭐ Tóm tắt cập nhật

Ứng dụng Flashcard Hub đã được cấu hình lại sử dụng **SQLite** thay vì MySQL, với **app.py** làm entry point chính. Giờ đây dễ dàng hơn 10 lần để setup và deploy!

---

## 🎯 Những tính năng chính

### ✅ SQLITE - Không cần setup database!

```bash
# Trước: Cần MySQL
CREATE DATABASE flashcard_hub;
mysql -u root -p < database-schema.sql

# Sau: Tự động!
python app.py
# Database tạo tự động ✨
```

### ✅ app.py - Khởi động siêu đơn giản

```bash
# Không cần nhớ câu lệnh dài
python app.py
# Server chạy ngay! 🚀
```

### ✅ start.bat - Windows chỉ cần double-click!

```
Nhấp đúp vào start.bat
Xong! ✨
```

---

## 📋 Danh sách tệp tin mới

### 🚀 Startup Scripts
- `start.bat` - Windows one-click start
- `start.sh` - Linux/Mac one-click start
- `check.py` - System health check

### 📖 Documentation
- `QUICKSTART.md` - 5-minute quick start
- `DEPLOYMENT.md` - Triển khai lên Heroku, Railway, Docker, VPS
- `MIGRATION_GUIDE.md` - Hướng dẫn từ MySQL → SQLite

### 📦 Backend Updates
- `app.py` - ⭐ Main entry point
- `wsgi.py` - Production WSGI entry
- `requirements-prod.txt` - Production dependencies
- `Procfile` - Heroku deployment
- `runtime.txt` - Python version spec
- `build.sh` - Build script

### 🔄 Updated Files
- `database.py` - SQLite config
- `main.py` - Removed DB init
- `requirements.txt` - Removed pymysql
- `README.md` - Updated setup steps
- `DEVELOPMENT.md` - No MySQL steps
- `.env.example` - SQLite defaults

---

## 🚀 Bắt đầu trong 3 bước

### 1️⃣ Windows

```batch
start.bat
```

### 2️⃣ Linux/Mac

```bash
chmod +x start.sh
./start.sh
```

### 3️⃣ Manual (All OS)

```bash
cd backend
python -m venv ../venv
../venv/Scripts/activate  # Windows
# source ../venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py
```

---

## 📍 Server URLs

Sau khi chạy, truy cập:

| Tên | URL | Mô tả |
|-----|-----|--------|
| 🌐 Frontend | http://localhost:3000 | React UI |
| 🔌 API | http://localhost:8000 | FastAPI server |
| 📚 API Docs | http://localhost:8000/docs | Swagger UI |
| ✅ Health | http://localhost:8000/api/health | Server status |

---

## 📊 So sánh MySQL vs SQLite

| Tiêu chí | MySQL | SQLite |
|----------|-------|--------|
| **Setup** | ❌ 10+ bước | ✅ 0 bước |
| **Database Server** | ❌ Cần cài | ✅ Built-in |
| **Setup Time** | ❌ 15+ phút | ✅ 30 giây |
| **File** | 📦 Remote | 📄 Local |
| **Backup** | 🔧 Phức tạp | ✅ Copy file |
| **Portability** | ❌ Không dễ | ✅ Plug & play |
| **Dev Experience** | ⚠️ Medium | ✅ Great |
| **Deploy** | ⚠️ Complex | ✅ Easy |
| **Performance** | ✅ Many connections | ✅ Local access |
| **Small Projects** | ❌ Overkill | ✅ Perfect |

---

## 🔍 Kiểm tra hệ thống

```bash
python check.py
```

Output sẽ hiển thị:
- ✅ Python version
- ✅ Node.js version
- ✅ Dependencies
- ✅ Database status
- ⏳ API status
- ⏳ Frontend status

---

## 🌐 Triển khai

### Heroku (Free, Recommended)

```bash
git push heroku main
```

Tự động sử dụng:
- `Procfile` → Server config
- `runtime.txt` → Python version
- `requirements.txt` → Dependencies

### Railway (Free, Easy)

```bash
railway login
railway init
railway up
```

### Docker

```bash
docker-compose up
```

### VPS (AWS, DigitalOcean, Linode)

```bash
# SSH vào server
# Clone repo
# python -m venv venv
# pip install gunicorn
# gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app
```

---

## 📚 Documentation Map

```
README.md              ← Main docs
├─ QUICKSTART.md      ← Start here! (5 min)
├─ DEVELOPMENT.md     ← Dev guide
├─ DEPLOYMENT.md      ← Deploy options
├─ MIGRATION_GUIDE.md ← What's new
├─ backend/README.md  ← Backend docs
└─ frontend/README.md ← Frontend docs
```

---

## 🎁 Bonus Features

### 1. System Check
```bash
python check.py
```

### 2. Auto-Start Scripts
```bash
start.bat      # Windows
./start.sh     # Linux/Mac
```

### 3. Production Ready
- Procfile ✅
- WSGI entry ✅
- Gunicorn support ✅
- Docker support ✅

### 4. Multiple Deployments
- Heroku ✅
- Railway ✅
- Render ✅
- Docker ✅
- VPS ✅

### 5. Vietnamese Docs
- QUICKSTART.md ✅
- DEPLOYMENT.md (VN sections) ✅
- MIGRATION_GUIDE.md ✅

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `npx kill-port 3000` |
| Port 8000 in use | `lsof -ti:8000 \| xargs kill -9` |
| ModuleNotFoundError | Activate venv first |
| npm not found | Install Node.js |
| Can't run start.bat | Use cmd.exe, not PowerShell |

---

## 📦 Database

### SQLite
- **File**: `backend/flashcard_hub.db`
- **Size**: ~100 KB (empty)
- **Auto-created**: Yes, on first run
- **Backup**: Just copy the .db file!

### Tables
- `users` - User accounts
- `decks` - Flashcard decks
- `cards` - Individual cards
- `study_sessions` - Study history
- `card_reviews` - SRS data

---

## 🧪 Test Setup

```bash
# Verify Python
python --version       # Should be 3.10+

# Verify Node
node --version         # Should be 18+

# Verify setup
python check.py
```

---

## 🚀 Next Steps

1. ✅ Clone/Download project
2. ✅ Chạy `start.bat` (Windows) hoặc `./start.sh` (Linux/Mac)
3. ✅ Mở http://localhost:3000
4. ✅ Tạo deck hoặc upload HTML
5. ✅ Bắt đầu học!

---

## 💬 Support

- **Docs**: See README.md
- **API**: http://localhost:8000/docs
- **Issues**: Check DEVELOPMENT.md
- **Deploy**: Check DEPLOYMENT.md

---

## 🎉 That's it!

**Enjoy your simplified Flashcard Hub setup!**

```
                    📚 Happy Learning! 📚
```

---

**Version**: 2.0 (SQLite Edition)  
**Updated**: 2026  
**Status**: Production Ready ✅
