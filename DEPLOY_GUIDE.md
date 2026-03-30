# Deployment Guide - Pterodactyl Hosting

## ⚠️ Problem
Lỗi: `No space left on device` khi compile pydantic-core từ source

## ✅ Solutions

### Solution 1: Use Pre-built Wheels (Recommended)
Pterodactyl server thường thiếu dung lượng khi compile Rust packages. 

```bash
# Install with pre-built wheels only (no compilation)
pip install --only-binary :all: -r requirements-prod.txt

# OR force binary wheels
pip install --prefer-binary -r requirements-prod.txt
```

### Solution 2: Lightweight Alternative (If Still Fails)
Nếu vẫn hết dung lượng, dùng version nhẹ hơn:

```bash
# Downgrade to pydantic v2.0 (smaller binary)
pip install pydantic==2.0.0 fastapi==0.104.1
```

### Solution 3: Clean Up Before Install
```bash
# Clear pip cache
pip cache purge

# Install without caching
pip install --no-cache-dir -r requirements-prod.txt
```

### Solution 4: Increase Server Storage
Liên hệ Pterodactyl support hoặc upgrade plan có dung lượng lớn hơn.

## 📋 Environment Variables

Thêm vào Pterodactyl startup command:

```bash
export PIP_NO_CACHE_DIR=1
export PYTHONUNBUFFERED=1
cd /home/container && pip install --prefer-binary -r requirements-prod.txt && python /home/container/app.py
```

## 🔍 Check Python Version

Pterodactyl phải dùng Python 3.10+:

```bash
python --version
# Nếu < 3.10, liên hệ support để upgrade
```

## 📦 Alternative: Docker

Nếu Pterodactyl support Docker, dùng Dockerfile:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements-prod.txt .
RUN pip install --no-cache-dir -r requirements-prod.txt
COPY . .
CMD ["python", "app.py"]
```

## ✅ Verify Installation

```bash
python -c "from fastapi import FastAPI; print('OK')"
```

Nếu không lỗi → Ready to deploy!

## 📞 Support

Nếu vẫn lỗi:
1. Check disk space: `df -h`
2. Check Python version: `python --version`
3. Check pip cache: `pip cache dir`
