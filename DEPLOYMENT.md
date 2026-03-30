# Deployment Guide - Flashcard Hub

Hướng dẫn triển khai ứng dụng lên các nền tảng khác nhau.

## 🚀 Triển khai nhanh

### 1. Heroku (Miễn phí)

#### Chuẩn bị
- Tài khoản Heroku (https://heroku.com)
- Heroku CLI
- Git

#### Các bước

```bash
# Login Heroku
heroku login

# Tạo app
heroku create your-app-name

# Thêm buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/python

# Deploy
git push heroku main

# Xem logs
heroku logs --tail
```

#### Procfile (tạo trong root directory)
```
web: cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT wsgi:app
release: cd backend && python -m alembic upgrade head
```

#### requirements-prod.txt
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.13.0
pydantic==2.5.0
pydantic[email]==2.5.0
beautifulsoup4==4.12.2
python-multipart==0.0.6
jinja2==3.1.2
gunicorn==21.2.0
```

---

### 2. Vercel (Frontend)

```bash
# Cài Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Configurate lại API endpoint trong .env.production
REACT_APP_API_URL=https://your-backend-heroku.herokuapp.com
```

---

### 3. Railway (Dễ sử dụng)

#### Backend
```bash
# Login
railway login

# Tạo project
railway init

# Deploy
railway up
```

#### Cấu hình
- Database: SQLite (built-in, không cần setup)
- Environment: Python 3.10
- Start command: `python app.py`

---

### 4. Render (Miễn phí, dễ dàng)

1. Đăng nhập https://render.com
2. Create New → Web Service
3. Connect GitHub repository
4. Cấu hình:
   - **Build Command**: 
     ```
     pip install -r backend/requirements.txt
     cd frontend && npm install && npm run build
     ```
   - **Start Command**: 
     ```
     cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT wsgi:app
     ```

---

### 5. Docker + VPS/Cloud

#### Dockerfile (Backend)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "wsgi:app"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: sqlite:///./flashcard_hub.db
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    depends_on:
      - backend
```

#### Triển khai
```bash
# Build
docker-compose build

# Chạy
docker-compose up
```

---

### 6. Linux VPS (DigitalOcean, Linode, etc.)

#### 1. Setup Server
```bash
# SSH vào server
ssh root@your_ip

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y python3.10 python3-pip nodejs npm nginx
```

#### 2. Deploy Backend
```bash
# Clone repo
git clone <your-repo>
cd flashcard-hub/backend

# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-prod.txt

# Chạy với Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app &
```

#### 3. Deploy Frontend
```bash
cd ../frontend

npm install
npm run build

# Copy build files to Nginx
sudo cp -r build/* /var/www/html/
```

#### 4. Configure Nginx
```nginx
# /etc/nginx/sites-available/default

upstream api {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;
    client_max_body_size 10M;

    # API proxy
    location /api/ {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri /index.html;
    }
}
```

```bash
# Restart Nginx
sudo systemctl restart nginx
```

#### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### 7. Windows Server

```batch
# Install Python 3.10
# Download từ python.org
python --version

# Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install gunicorn

# Chạy
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app
```

---

## 📊 So sánh các nền tảng

| Platform | Giá | Setup | Uptime | Database |
|----------|-----|-------|--------|----------|
| Heroku | $50+/tháng | Dễ | 99.9% | PostgreSQL |
| Vercel | Miễn phí | Dễ | 99.9% | N/A |
| Railway | $5+/tháng | Vừa | 99% | SQLite |
| Render | Miễn phí | Dễ | 99% | SQLite |
| Docker | $5+/tháng | Khó | Tuỳ | SQLite |
| VPS | $5+/tháng | Khó | Tuỳ | SQLite |

---

## 🔒 Bảo mật Sản xuất

### 1. Environment Variables
Không commit `.env` file. Sử dụng variables trên platform:

```bash
DATABASE_URL=sqlite:///./flashcard_hub.db
SECRET_KEY=your-random-key-here
DEBUG=False
```

### 2. HTTPS
Luôn sử dụng HTTPS trên production.

### 3. CORS
Update CORS settings cho production domain:

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 4. Database Backup
Backup regular SQLite database:

```bash
# Cron job hàng ngày
0 2 * * * cp /app/backend/flashcard_hub.db /backup/flashcard_hub_$(date +\%Y\%m\%d).db
```

---

## 🧪 Testing trước Deploy

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

---

## 📈 Monitoring

### Logs
```bash
# Heroku
heroku logs --tail

# Railway
railway logs

# VPS
tail -f /var/log/gunicorn.log
```

### Performance
- New Relic (free tier)
- DataDog
- Sentry (error tracking)

---

**Chọn nền tảng phù hợp với nhu cầu của bạn!**
