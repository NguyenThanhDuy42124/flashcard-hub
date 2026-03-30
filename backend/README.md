# Flashcard Hub Backend - FastAPI + SQLite

FastAPI backend for the Flashcard Hub learning platform using SQLite database.

## ✨ Features

- 🚀 FastAPI with automatic API documentation
- 📦 SQLite database (no external dependencies)
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

- **Type**: SQLite
- **File**: `flashcard_hub.db` (auto-created)
- **Location**: Backend directory
- **No setup needed** - tables created automatically on startup

## Environment Variables

```bash
DATABASE_URL=sqlite:///./flashcard_hub.db  # Custom DB location
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
