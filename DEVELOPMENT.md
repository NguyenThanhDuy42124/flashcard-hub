# Flashcard Hub Development Guide

## 📋 Directory Structure Quick Reference

```
flashcard-hub/
├── backend/          # FastAPI backend application
├── frontend/         # React frontend application
├── start.bat        # Quick start script (Windows)
├── start.sh         # Quick start script (Linux/Mac)
├── .env             # Environment variables (create from .env.example)
├── docker-compose.yml # Docker setup for local development
└── README.md        # Main project documentation
```

## 🔧 Setup Steps

### Step 1: Backend Setup (Easy!)
```bash
cd backend
python -m venv ../venv
../venv/Scripts/activate  # Windows
pip install -r requirements.txt
python app.py
```

✅ **No database setup needed!** SQLite database is created automatically.

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📚 Key Files

### Backend
- **app.py** - Application entry point (run this!)
- **wsgi.py** - WSGI entry point for production
- **main.py** - FastAPI application with all routes
- **models.py** - Database models (User, Deck, Card, etc.)
- **parser.py** - HTML parsing logic
- **srs_engine.py** - Spaced repetition algorithm
- **database.py** - SQLite connection setup

### Frontend
- **App.js** - Main router and navigation
- **components/DeckList.js** - Browse decks
- **components/Uploader.js** - Upload HTML files
- **components/DeckBuilder.js** - Create decks manually
- **components/StudyMode.js** - Study interface
- **components/Flashcard.js** - Card flip animation

## 🚀 Key Features

### 1. HTML Upload
- Upload pre-built HTML files
- Auto-parse cardsData JSON
- Store in SQLite database

### 2. Deck Builder
- Create cards through UI
- Add unlimited cards
- Tag for organization

### 3. Study Mode
- 3D card flip animations
- SRS-based scheduling
- Progress tracking

### 4. Spaced Repetition
- SuperMemo-2 algorithm
- Quality-based scheduling
- Ease factor tracking

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill: `npx kill-port 3000` |
| Port 8000 in use | Kill: `lsof -ti:8000 \| xargs kill -9` |
| Dependencies missing | Run `pip install -r requirements.txt` or `npm install` |
| ModuleNotFoundError | Activate virtual environment first |

## 📖 API Testing

### Using Swagger UI
Visit http://localhost:8000/docs for interactive API testing

### Using cURL
```bash
# List decks
curl http://localhost:8000/api/decks

# Create deck
curl -X POST http://localhost:8000/api/decks/create \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test deck", "cards": []}'
```

## 🔄 Workflow

### Adding New Endpoint
1. Update `models.py` if schema changes
2. Update `schemas.py` for request/response
3. Add route in `main.py`
4. Test via Swagger UI

### Frontend Component
1. Create component file in `components/`
2. Add route in `App.js` if needed
3. Use API calls from `api.js`
4. Style with Tailwind CSS

## 📊 Database

- **Type**: SQLite
- **File**: `flashcard_hub.db`
- **Location**: `backend/` directory
- **Tables**: users, decks, cards, study_sessions, card_reviews
- **Auto-created** on first run of `python app.py`

## 🎯 Next Steps

1. ✅ Backend & Frontend Complete
2. ✅ Database (SQLite) Auto-setup
3. ⬜ Run `python app.py` in backend
4. ⬜ Run `npm start` in frontend
5. ⬜ Test upload functionality
6. ⬜ Test deck creation
7. ⬜ Test study mode

---

For detailed documentation, see:
- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Main: `README.md`
