# Flashcard Hub Backend - FastAPI + MySQL/SQLite

FastAPI backend for the Flashcard Hub learning platform using MySQL or SQLite.

## ✨ Features

- 🚀 FastAPI with automatic API documentation
- 📦 MySQL via env config (with SQLite fallback)
- 🧠 Spaced Repetition System (SuperMemo-2)
- 📤 HTML parser for importing flashcards
- 👤 User authentication & progress tracking
- 📊 Study statistics and analytics

## Prerequisites

- Python 3.10+
- pip package manager

## Quick Start

### 1. Setup Virtual Environment

```bash
python -m venv ../venv

# Windows
../venv/Scripts/activate

# Linux/Mac
source ../venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Server

**Development:**
```bash
python app.py
```

**With Uvicorn:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Production (Gunicorn):**
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app
```

## Server URLs

- **API Base**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database

- **Preferred**: MySQL (`mysql+pymysql`)
- **Fallback**: SQLite file when MySQL env is not configured

### MySQL quick setup (recommended)

1. Copy `backend/.env.mysql.example` -> `backend/.env.mysql`
2. Fill your real values:
	- `MYSQL_ENDPOINT` (example `103.228.36.238:3307`)
	- `MYSQL_DATABASE`
	- `MYSQL_USER`
	- `MYSQL_PASSWORD`
3. Start backend normally (`python app.py` or `uvicorn main:app ...`)

`backend/database.py` will auto-load `backend/.env.mysql` and build `DATABASE_URL`.

## Environment Variables

```bash
DATABASE_URL=mysql+pymysql://user:pass@127.0.0.1:3306/flashcard_hub?charset=utf8mb4
MYSQL_ENDPOINT=127.0.0.1:3306
MYSQL_DATABASE=flashcard_hub
MYSQL_USER=root
MYSQL_PASSWORD=your_password
HOST=0.0.0.0                               # Server host
PORT=8000                                  # Server port
RELOAD=True                                # Auto-reload on code changes
```

## API Endpoints

### Decks
- `GET /api/decks` - List all decks
- `POST /api/decks/create` - Create new deck
- `POST /api/decks/upload-html` - Upload HTML deck
- `GET /api/decks/{id}` - Get deck details
- `GET /api/decks/{id}/cards` - Get cards
- `PUT /api/decks/{id}` - Update deck
- `DELETE /api/decks/{id}` - Delete deck

### Cards
- `POST /api/cards` - Create card
- `PUT /api/cards/{id}` - Update card
- `DELETE /api/cards/{id}` - Delete card

### Study & SRS
- `POST /api/study-sessions` - Start session
- `POST /api/cards/{id}/review` - Submit review
- `GET /api/users/progress` - Get statistics

### Health
- `GET /api/health` - Health check

## Project Structure

```
backend/
├── app.py              # Entry point
├── wsgi.py             # Production entry
├── main.py             # FastAPI app
├── database.py         # SQLite setup
├── models.py           # Database models
├── schemas.py          # Request/response
├── parser.py           # HTML parser
├── srs_engine.py       # SRS algorithm
└── requirements.txt    # Dependencies
```

## Deployment

### Heroku
```bash
git push heroku main
```

### Docker
```bash
docker build -t flashcard-hub-backend .
docker run -p 8000:8000 flashcard-hub-backend
```

### VPS / Cloud Server
```bash
# Install dependencies
sudo apt-get update
sudo apt-get install python3.10 python3-pip

# Clone and setup
git clone <repo>
cd flashcard-hub/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app
```
