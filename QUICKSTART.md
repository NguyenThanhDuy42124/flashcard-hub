# 🚀 QUICKSTART - Flashcard Hub

## ⚡ Chạy nhanh (Windows)

### Cách 1: Click vào start.bat (Dễ nhất!)

```
Vào thư mục flashcard-hub
Double-click vào start.bat
```

✅ Sẽ mở 2 cửa sổ:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

### Cách 2: Command Line

```powershell
# Di chuyển vào thư mục
cd flashcard-hub

# Chạy backend
cd backend
python -m venv ../venv
../venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

Mở terminal khác:
```powershell
cd frontend
npm install
npm start
```

---

## ⚡ Chạy nhanh (Linux/Mac)

```bash
cd flashcard-hub

# Make script executable
chmod +x start.sh

# Chạy
./start.sh
```

Hoặc manually:

```bash
# Terminal 1 - Backend
cd backend
python3 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
python3 app.py

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

---

## 🔗 Truy cập ứng dụng

| Tên | URL | Mô tả |
|-----|-----|--------|
| **Frontend** | http://localhost:3000 | Giao diện chính |
| **Backend API** | http://localhost:8000 | API Server |
| **API Docs** | http://localhost:8000/docs | Swagger UI |
| **Health Check** | http://localhost:8000/api/health | Kiểm tra server |

---

## 📝 Các tính năng chính

### 1️⃣ Trang chủ - Xem Deck
- Xem danh sách tất cả flashcard decks
- Tìm kiếm theo tiêu đề
- Lọc theo tag

### 2️⃣ Tải lên HTML
- Chọn file HTML flashcard
- Tự động phân tích dữ liệu
- Lưu vào database

### 3️⃣ Tạo Deck
- Tạo flashcard thủ công
- Thêm unlimited cards
- Gắn tag cho deck

### 4️⃣ Chế độ Học
- Thẻ 3D flip với animation
- Đánh giá mức độ nhớ (0-5)
- Tính toán lịch review tự động (SRS)

---

## 🗂️ Cấu trúc Project

```
flashcard-hub/
├── backend/              # FastAPI Backend
│   ├── app.py           # ⭐ Chạy backend từ đây
│   ├── main.py          # FastAPI routes
│   ├── models.py        # Database models
│   └── requirements.txt  # Python dependencies
│
├── frontend/            # React Frontend  
│   ├── src/
│   │   ├── App.js
│   │   ├── components/  # React components
│   │   └── api.js       # API calls
│   ├── package.json
│   └── public/
│
├── start.bat           # Script chạy Windows
├── start.sh            # Script chạy Linux/Mac
├── README.md           # Tài liệu chính
└── DEPLOYMENT.md       # Hướng dẫn deploy
```

---

## 🐛 Xử lý lỗi phổ biến

### ❌ Lỗi: "Port 3000 in use" / "Port 8000 in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# Hoặc dùng tool
npx kill-port 3000
```

### ❌ Lỗi: "ModuleNotFoundError"

```bash
# Kiểm tra virtual environment
../venv/Scripts/activate  # Windows
source ../venv/bin/activate  # Linux/Mac

# Cài lại dependencies
pip install -r requirements.txt
```

### ❌ Lỗi: "npm command not found"

```bash
# Kiểm tra Node.js đã cài
node -v
npm -v

# Nếu chưa, tải từ https://nodejs.org/
```

### ❌ Lỗi: API không kết nối

- Kiểm tra backend chạy trên port 8000
- Kiểm tra frontend .env file có `REACT_APP_API_URL=http://localhost:8000`
- Clear browser cache (Ctrl+Shift+Delete)

---

## 💾 Database

- **Type**: SQLite
- **File**: `backend/flashcard_hub.db`
- **Tự động tạo** khi chạy `python app.py`
- **Không cần setup riêng** - không cần MySQL!

---

## 📱 Sử dụng API

### Ví dụ: Lấy tất cả Deck

```bash
curl http://localhost:8000/api/decks
```

### Ví dụ: Tạo Deck mới

```bash
curl -X POST http://localhost:8000/api/decks/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tiếng Anh",
    "description": "Từ vựng tiếng Anh",
    "cards": [],
    "tag": "Languages",
    "is_public": true
  }'
```

Xem đầy đủ tại: http://localhost:8000/docs

---

## 🚀 Triển khai (Deploy)

### Heroku (Đơn giản nhất)

```bash
heroku login
heroku create your-app-name
git push heroku main
```

Xem thêm: `DEPLOYMENT.md`

---

## 📚 Tài liệu

- `README.md` - Tài liệu chính
- `DEVELOPMENT.md` - Hướng dẫn phát triển
- `DEPLOYMENT.md` - Hướng dẫn triển khai
- `backend/README.md` - Hướng dẫn backend
- `frontend/README.md` - Hướng dẫn frontend

---

## ✅ Checklist Bắt đầu

- [ ] Clone repo hoặc tải code
- [ ] Chạy backend: `python app.py`
- [ ] Chạy frontend: `npm start`
- [ ] Mở http://localhost:3000
- [ ] Tạo deck mới hoặc tải HTML
- [ ] Bắt đầu học!

---

## 💬 Cần giúp?

1. Kiểm tra `DEVELOPMENT.md` - Xử lý lỗi phổ biến
2. Xem API docs: http://localhost:8000/docs
3. Mở issue trên GitHub

---

**Vui lòi học tập! 📚**
