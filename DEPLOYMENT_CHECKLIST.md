# Deployment Checklist - ResponseValidationError Fix

## Issue Summary
The `/api/decks` endpoint was returning `500 Internal Server Error` with `ResponseValidationError` because the database schema was missing the `title` and `chapter` columns that were added to the Card model.

## Solution Implemented
- ✅ Auto-migration on app startup (main.py) - Automatically runs `alembic upgrade head`
- ✅ Default values for new columns (models.py) - Safe defaults prevent serialization errors
- ✅ Simplified schemas (schemas.py) - Optional fields handle missing data gracefully
- ✅ Fixed WSGI entry point (wsgi.py) - Corrected imports for Gunicorn deployment

## Deployment Steps

### 1. Pull Latest Code
```bash
cd /home/container
git pull
# Should show commits up to: a9f399b cleanup: Remove test scripts from repo
```

### 2. Restart Application
```bash
systemctl restart App-1
# OR if using PM2:
# pm2 restart flashcard-hub-backend

# OR if using Pterodactyl panel: Restart the server
```

### 3. What Happens Automatically
When the app starts, it will:
1. Load FastAPI with all dependencies
2. Detect Alembic migration runner
3. Execute `alembic upgrade head` (auto-migration)
4. Add `title` and `chapter` columns to the `cards` table
5. Create indexes for performance
6. Start listening on port 25297

### 4. Verification

**Check Status:**
```bash
# Monitor server logs for migration success message:
# ✅ Database migrations completed
```

**Test Endpoints:**
```bash
# Test 1: Homepage loads (GET / should return React app)
curl -I http://localhost:25297/

# Test 2: Get decks list (GET /api/decks should return 200 OK)
curl http://localhost:25297/api/decks

# Test 3: Get specific deck with cards (GET /api/decks/1/cards)
curl http://localhost:25297/api/decks/1/cards
```

## Rollback (if needed)
```bash
cd /home/container/backend
alembic downgrade -1  # Removes title/chapter columns
systemctl restart App-1
```

## Files Modified

### Core Fixes
- **backend/main.py**: Added auto-migration runner on startup
- **backend/models.py**: Added default values to title/chapter columns
- **backend/schemas.py**: Simplified field validation
- **backend/wsgi.py**: Fixed import path

### Migrations
- **backend/alembic/versions/002_add_card_title_chapter.py**: Adds title/chapter columns with indexes

## Expected Behavior After Deployment

### ✅ Working Correctly
- Homepage loads without "Failed to load decks" error
- DeckList component displays all decks
- `/api/decks` returns `200 OK` with deck list
- `/api/decks/{id}/cards` returns cards with title/chapter fields (null until set)
- Cards created going forward will have title/chapter populated
- Existing cards will have null values for title/chapter (safe)

### ⚠️ Notes
- Existing cards won't have title/chapter data (they'll be null) - this is expected
- New cards created through the UI will have these fields populated
- Migration runs automatically - no manual steps needed

## Success Indicators
1. ✅ App starts without migration errors
2. ✅ `/api/decks` endpoint responds with 200 OK
3. ✅ No ResponseValidationError in logs
4. ✅ Frontend displays decks and can create new cards

## Support
If issues occur, check:
1. Server logs for "Database migrations completed" message
2. Database file permissions (`flashcard_hub.db`)
3. Alembic configuration (`backend/alembic.ini`)
4. Python version (should be 3.10+)
5. Try manual migration: `cd backend && alembic upgrade head`
