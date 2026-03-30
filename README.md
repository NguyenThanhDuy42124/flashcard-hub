# Flashcard Hub - Full-Stack Learning Platform

A comprehensive web application for creating, uploading, and studying interactive 3D flashcards with intelligent spaced repetition system (SuperMemo-2).

![Architecture](https://img.shields.io/badge/Full%20Stack-Python%20%2B%20React-blue)
![Python](https://img.shields.io/badge/Python-3.10%2B-green)
![React](https://img.shields.io/badge/React-19-61DAFB)
![Database](https://img.shields.io/badge/Database-MySQL%208-blue)

## 📋 Features

### Core Features
- **🏠 Homepage Dashboard** — Centralized hub to view, search, and access all available flashcard decks
- **📤 HTML Deck Uploader** — Upload pre-built HTML files with automatic JSON parsing and database storage (json5 parser for JavaScript objects)
- **🎨 Visual Deck Builder** — Create new flashcards manually through an intuitive UI
- **🎯 Interactive Study Mode** — Study with 3D flip animations, grid view (up to 3 cards per row), chapter filters
- **🧠 Spaced Repetition System (SRS)** — SuperMemo-2 algorithm for optimal card scheduling
- **👤 User Authentication** — Save progress, bookmarks, and personal study statistics
- **📊 Progress Tracking** — View detailed statistics on study sessions and card retention
- **🌐 Responsive Design** — Fully mobile-optimized, works on desktop/tablet/phone
- **🇻🇳 Vietnamese UI** — Full Vietnamese localization for all components

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.10 + FastAPI |
| **Database** | SQLite (built-in, no setup needed) |
| **Frontend** | React 19 + React Router + Tailwind CSS |
| **Algorithm** | SuperMemo-2 (Spaced Repetition) |

## 📦 Project Structure

```
flashcard-hub/
├── backend/
│   ├── main.py              # FastAPI application with all routes
│   ├── database.py          # Database connection configuration
│   ├── models.py            # SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── parser.py            # HTML parsing logic
│   ├── srs_engine.py        # Spaced repetition algorithm
│   ├── requirements.txt     # Python dependencies
│   ├── alembic/             # Database migrations
│   │   ├── env.py
│   │   └── versions/
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DeckList.js      # Homepage dashboard
│   │   │   ├── Uploader.js      # HTML uploader
│   │   │   ├── DeckBuilder.js   # Manual deck creation
│   │   │   ├── StudyMode.js     # Main study interface
│   │   │   └── Flashcard.js     # Card flip component
│   │   ├── App.js               # Main router setup
│   │   ├── api.js               # Axios API client
│   │   ├── index.js             # React entry point
│   │   └── index.css            # Global styles
│   ├── public/
│   │   └── index.html           # HTML template
│   ├── package.json
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js
│   └── README.md
│
└── README.md (this file)
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- (No database server needed - SQLite is included)

### 1️⃣ Windows - Easy Start

```bash
# Just double-click start.bat
start.bat
```

Or manually:

```bash
cd backend
python -m venv ../venv
../venv/Scripts/activate
pip install -r requirements.txt
python app.py
```

### 2️⃣ Linux/Mac - Easy Start

```bash
# Make script executable
chmod +x start.sh

# Run script
./start.sh
```

Or manually:

```bash
cd backend
python3 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

### 3️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv ../venv

# Activate (Windows)
../venv/Scripts/activate
# Activate (Linux/Mac)
# source ../venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server (port 8000)
python app.py
```

API will be available at:
- **Base URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc

### 4️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 3000)
npm start
```

Open http://localhost:3000 in your browser.

## 📡 API Endpoints

### Decks
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/decks` | List all public decks with pagination |
| `POST` | `/api/decks/create` | Create new deck manually |
| `POST` | `/api/decks/upload-html` | Upload and parse HTML deck |
| `GET` | `/api/decks/{id}` | Get specific deck |
| `GET` | `/api/decks/{id}/cards` | Get all cards in deck |
| `PUT` | `/api/decks/{id}` | Update deck metadata |
| `DELETE` | `/api/decks/{id}` | Delete deck |

### Cards
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/cards` | Create new card in deck |
| `PUT` | `/api/cards/{id}` | Update card content |
| `DELETE` | `/api/cards/{id}` | Delete card |

### Study & SRS
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/study-sessions` | Start new study session |
| `POST` | `/api/cards/{id}/review` | Submit card review (triggers SRS) |
| `GET` | `/api/users/progress` | Get user statistics |

### Health
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check endpoint |

## 🧠 How It Works

### HTML Parsing
1. User uploads `.html` file via the Uploader component
2. Backend uses BeautifulSoup to find `<script type="text/babel">` tag
3. Regex extracts `cardsData` JSON array from script
4. Pydantic validates the structure
5. Data is stored in MySQL database (Decks & Cards tables)

### Study Algorithm (SuperMemo-2)
The SM-2 algorithm automatically schedules card reviews based on:
- **Quality Rating** (0-5): How well you remember the card
- **Ease Factor**: Card difficulty multiplier (default: 2.5)
- **Interval**: Days until next review
- **Repetitions**: How many times reviewed

**Quality Scale:**
- **0**: Complete blackout - card forgotten
- **1**: Incorrect response
- **2**: Incorrect response but correct answer remembered
- **3**: Correct response after serious difficulty
- **4**: Correct response after some hesitation
- **5**: Perfect response

### Study Session Flow
1. User selects a deck and starts study
2. App presents first card
3. User rates recall quality (0-5)
4. SM-2 calculates next review date
5. App automatically advances to next card
6. Session statistics are tracked

## 🔄 Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `email` (Unique)
- `password_hash`
- `created_at`, `updated_at`

### Decks Table
- `id` (Primary Key)
- `title`, `description`, `tag`
- `owner_id` (Foreign Key → Users)
- `is_public`, `created_at`, `updated_at`

### Cards Table
- `id` (Primary Key)
- `deck_id` (Foreign Key → Decks)
- `front`, `back` (Card content)
- `created_at`, `updated_at`

### Study Sessions Table
- `id` (Primary Key)
- `user_id` (Foreign Key → Users)
- `deck_id` (Foreign Key → Decks)
- `cards_reviewed`, `cards_correct`
- `started_at`, `ended_at`

### Card Reviews Table
- `id` (Primary Key)
- `card_id` (Foreign Key → Cards)
- `study_session_id` (Foreign Key → Study Sessions)
- `quality`, `ease_factor`, `interval`, `repetitions`
- `next_review_date`, `reviewed_at`

## 📝 Example HTML Upload Format

```html
<!DOCTYPE html>
<html>
<head>
    <title>Spanish Vocabulary</title>
</head>
<body>
    <script type="text/babel">
        const cardsData = [
            { id: 1, front: "¿Hola?", back: "Hello", category: "Greetings" },
            { id: 2, front: "Gato", back: "Cat", category: "Animals" },
            { id: 3, front: "Libro", back: "Book", category: "Objects" }
        ];
    </script>
</body>
</html>
```

## 🎯 Development Workflow

### Adding New Features

1. **Backend**: Update models → schemas → routes → tests
2. **Frontend**: Update components → API calls → styles
3. **Database**: If schema changed, create migration with Alembic

### Running Tests

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Backend Issues
- **Database Connection Failed**: Check MySQL service is running
- **Port 8000 Already in Use**: `lsof -ti:8000 | xargs kill -9` (Mac/Linux)

### Frontend Issues
- **API 404 Errors**: Ensure backend is running on port 8000
- **Port 3000 Already in Use**: `npx kill-port 3000`

### Database Issues
- **Migration Errors**: Delete alembic_version table and run migrations again
- **Permission Denied**: Update MySQL credentials in `backend/database.py`

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [SuperMemo-2 Algorithm](https://en.wikipedia.org/wiki/Spaced_repetition#SM-2)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for learning**
