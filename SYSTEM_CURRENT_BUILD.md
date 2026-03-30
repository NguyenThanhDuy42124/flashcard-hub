# System Current Build - Flashcard Hub

## Project Overview
Flashcard Hub is a full-stack learning platform built with Python FastAPI backend and React frontend. It features intelligent flashcard management with a Spaced Repetition System (SRS) based on SuperMemo-2 algorithm.

## Current Build Status ✅

### Backend (Python/FastAPI)
- **Framework**: FastAPI 0.104.1
- **Runtime**: Uvicorn with Python 3.10+
- **Database**: SQLite (built-in, no external setup required)
- **ORM**: SQLAlchemy 2.0.23
- **API**: RESTful with automatic OpenAPI/Swagger documentation
- **Status**: Production ready

#### API Endpoints Available
1. **Health Check**
   - `GET /` - Server status check

2. **Decks Management**
   - `GET /decks/` - List all flashcard decks
   - `GET /decks/{deck_id}` - Get deck details
   - `POST /decks/` - Create new deck
   - `PUT /decks/{deck_id}` - Update deck
   - `DELETE /decks/{deck_id}` - Delete deck

3. **Cards Management**
   - `GET /decks/{deck_id}/cards` - Get all cards in deck
   - `POST /decks/{deck_id}/cards` - Create new card
   - `PUT /cards/{card_id}` - Update card
   - `DELETE /cards/{card_id}` - Delete card

4. **Study Mode**
   - `GET /study/{deck_id}` - Get cards for study session
   - `POST /study/review` - Submit card review with SRS algorithm
   - `GET /study/stats/{user_id}` - Get study statistics

5. **Deck Uploading**
   - `POST /upload/` - Upload HTML flashcard deck
   - HTML parsing with automatic JSON extraction

6. **User Management**
   - `POST /users/` - Create user account
   - `GET /users/{user_id}` - Get user profile
   - `PUT /users/{user_id}` - Update user

### Frontend (React 19)
- **Framework**: React 19 + React Router
- **Styling**: Tailwind CSS 3
- **Build Tool**: Create React App or Vite
- **Status**: Feature complete

#### React Components
1. **DeckList.js** - Homepage with deck discovery and browsing
2. **DeckBuilder.js** - Manual flashcard creation interface
3. **StudyMode.js** - Interactive study with 3D flip animations
4. **Flashcard.js** - Individual 3D flashcard component
5. **Uploader.js** - HTML deck file upload interface

### Core Features Implemented ✅
- ✅ Deck management (CRUD operations)
- ✅ Flashcard creation and editing
- ✅ HTML deck uploading with parsing
- ✅ 3D study mode with animations
- ✅ SuperMemo-2 SRS algorithm
- ✅ Study statistics tracking
- ✅ User authentication framework
- ✅ CORS support for frontend integration
- ✅ SQLite database with SQLAlchemy ORM
- ✅ Automatic database migrations (Alembic)

## Project Structure
```
flashcard-hub/
├── app.py                      # Root entry point
├── start.py                    # Start script
├── requirements.txt            # Python dependencies
├── Procfile                    # Heroku deployment config
├── README.md                   # Documentation
├── SYSTEM_CURRENT_BUILD.md    # This file
│
├── backend/
│   ├── main.py                # FastAPI application
│   ├── app.py                 # DB initialization
│   ├── database.py            # SQLAlchemy setup
│   ├── models.py              # ORM models
│   ├── schemas.py             # Pydantic schemas
│   ├── parser.py              # HTML parsing
│   ├── srs_engine.py          # SuperMemo-2 algorithm
│   ├── requirements.txt        # Backend dependencies
│   ├── alembic.ini            # Alembic config
│   ├── alembic/               # Database migrations
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   └── README.md
│
├── frontend/
│   ├── package.json           # NPM dependencies
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── index.js           # React entry point
│   │   ├── api.js             # API client
│   │   ├── index.css          # Global styles
│   │   └── components/
│   │       ├── DeckList.js
│   │       ├── DeckBuilder.js
│   │       ├── StudyMode.js
│   │       ├── Flashcard.js
│   │       └── Uploader.js
│   ├── public/
│   │   └── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
└── venv/                      # Python virtual environment
```

## Running the Application

### Windows
```bash
# Setup
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Start backend
python start.py

# Start frontend (in new terminal)
cd frontend
npm install
npm start
```

### Linux/Mac
```bash
# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start backend
python start.py

# Start frontend (in new terminal)
cd frontend
npm install
npm start
```

## API Documentation
When running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Information
- **Type**: SQLite
- **Location**: `flashcard.db` (auto-created)
- **Tables**:
  - `users` - User accounts and profiles
  - `decks` - Flashcard collections
  - `cards` - Individual flashcards
  - `card_reviews` - Study session data
  - `study_sessions` - Aggregated study stats

## Deployment
- **Production Server**: Gunicorn (configurable via Procfile)
- **Environment Variables**:
  - `HOST` - Server host (default: 0.0.0.0)
  - `PORT` - Server port (default: 8000)
  - `RELOAD` - Enable auto-reload (default: True)
  - `DATABASE_URL` - Database connection string

## Dependencies Summary
- Backend: 9 core packages + optional packages
- Frontend: React + Tailwind ecosystem
- No external database required (SQLite is built-in)

## Next Steps / Roadmap
- [ ] User authentication with JWT
- [ ] Social features (sharing decks, following users)
- [ ] Mobile app support
- [ ] Advanced analytics dashboard
- [ ] Collaborative deck editing
- [ ] Import from Anki/Quizlet formats

## Build Date
Generated: March 2026

## Support
For issues and questions, refer to:
- [README.md](README.md) - Main documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
