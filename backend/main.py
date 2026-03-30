"""FastAPI main application with all routes."""
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import os

from database import get_db
from models import User, Deck, Card, CardReview, StudySession
from schemas import (
    CardCreate, CardResponse, DeckCreate, DeckUpdate, DeckResponse,
    UserCreate, UserResponse, CardReviewRequest, StudySessionCreate,
    StudySessionResponse, UserProgressResponse, CreateDeckFromHTMLRequest
)
from parser import parse_html_file
from srs_engine import sm2_engine

# Initialize FastAPI app
app = FastAPI(
    title="Flashcard Hub API",
    description="Full-stack flashcard learning platform with SRS",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============== DECK ENDPOINTS ==============

@app.get("/api/decks", response_model=List[DeckResponse])
async def list_decks(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    tag: str = Query(None)
):
    """List all public decks with pagination and filtering."""
    query = db.query(Deck).filter(Deck.is_public == True)

    if tag:
        query = query.filter(Deck.tag == tag)

    decks = query.offset(skip).limit(limit).all()
    return decks


@app.post("/api/decks/create", response_model=DeckResponse)
async def create_deck(
    deck_data: DeckCreate,
    db: Session = Depends(get_db),
    user_id: int = 1  # In production, get from JWT token
):
    """Create a new deck manually via UI."""
    # Create deck
    new_deck = Deck(
        title=deck_data.title,
        description=deck_data.description,
        owner_id=user_id,
        tag=deck_data.tag,
        is_public=deck_data.is_public
    )
    db.add(new_deck)
    db.flush()

    # Add cards if provided
    for card_data in deck_data.cards:
        new_card = Card(
            deck_id=new_deck.id,
            front=card_data.front,
            back=card_data.back
        )
        db.add(new_card)

    db.commit()
    db.refresh(new_deck)
    return new_deck


@app.post("/api/decks/upload-html", response_model=DeckResponse)
async def upload_html_deck(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user_id: int = 1
):
    """Upload and parse an HTML file into a database deck."""
    try:
        print(f"📥 Uploading file: {file.filename}")
        
        # Read file content
        content = await file.read()
        print(f"📄 File size: {len(content)} bytes")
        
        html_content = content.decode('utf-8')
        print(f"✅ HTML decoded, length: {len(html_content)}")

        # Parse HTML
        print("🔍 Parsing HTML...")
        parsed_data = parse_html_file(html_content)
        print(f"✅ Parsed successfully: title='{parsed_data['title']}', cards={len(parsed_data['cards'])}")

        # Create deck
        new_deck = Deck(
            title=parsed_data['title'],
            description=parsed_data['description'],
            owner_id=user_id,
            is_public=True
        )
        db.add(new_deck)
        db.flush()
        print(f"✅ Deck created: id={new_deck.id}")

        # Add cards from parsed data
        for idx, card_data in enumerate(parsed_data['cards']):
            new_card = Card(
                deck_id=new_deck.id,
                front=card_data['front'],
                back=card_data['back']
            )
            db.add(new_card)
        
        db.commit()
        db.refresh(new_deck)
        print(f"✅ Deck committed with {len(parsed_data['cards'])} cards")

        return new_deck

    except Exception as e:
        print(f"❌ Error in upload_html_deck: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to parse HTML: {str(e)}")


@app.post("/api/decks/create-from-html-content", response_model=DeckResponse)
async def create_deck_from_html_content(
    request: CreateDeckFromHTMLRequest,
    db: Session = Depends(get_db),
    user_id: int = 1
):
    """Create a deck from HTML content (paste from text)."""
    try:
        # Parse HTML content
        parsed_data = parse_html_file(request.html_content)

        # Create deck with provided title and description
        new_deck = Deck(
            title=request.title or parsed_data.get('title', 'Untitled Deck'),
            description=request.description or parsed_data.get('description', ''),
            owner_id=user_id,
            tag=request.tag,
            is_public=True
        )
        db.add(new_deck)
        db.flush()

        # Add cards from parsed data
        for card_data in parsed_data['cards']:
            new_card = Card(
                deck_id=new_deck.id,
                front=card_data['front'],
                back=card_data['back']
            )
            db.add(new_card)

        db.commit()
        db.refresh(new_deck)

        return new_deck

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to parse HTML: {str(e)}")


@app.get("/api/decks/{deck_id}", response_model=DeckResponse)
async def get_deck(deck_id: int, db: Session = Depends(get_db)):
    """Get a specific deck with all its cards."""
    deck = db.query(Deck).filter(Deck.id == deck_id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    return deck


@app.get("/api/decks/{deck_id}/cards", response_model=List[CardResponse])
async def get_deck_cards(deck_id: int, db: Session = Depends(get_db)):
    """Get all cards for a specific deck."""
    deck = db.query(Deck).filter(Deck.id == deck_id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    cards = db.query(Card).filter(Card.deck_id == deck_id).all()
    return cards


@app.put("/api/decks/{deck_id}", response_model=DeckResponse)
async def update_deck(
    deck_id: int,
    deck_data: DeckUpdate,
    db: Session = Depends(get_db),
    user_id: int = 1
):
    """Update a deck."""
    deck = db.query(Deck).filter(Deck.id == deck_id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if deck.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update fields
    if deck_data.title is not None:
        deck.title = deck_data.title
    if deck_data.description is not None:
        deck.description = deck_data.description
    if deck_data.tag is not None:
        deck.tag = deck_data.tag
    if deck_data.is_public is not None:
        deck.is_public = deck_data.is_public

    deck.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(deck)
    return deck


@app.delete("/api/decks/{deck_id}")
async def delete_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    user_id: int = 1
):
    """Delete a deck."""
    deck = db.query(Deck).filter(Deck.id == deck_id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    if deck.owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(deck)
    db.commit()

    return {"message": "Deck deleted successfully"}


# ============== CARD ENDPOINTS ==============

@app.post("/api/cards", response_model=CardResponse)
async def create_card(
    deck_id: int,
    card_data: CardCreate,
    db: Session = Depends(get_db)
):
    """Create a new card in a deck."""
    deck = db.query(Deck).filter(Deck.id == deck_id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    new_card = Card(
        deck_id=deck_id,
        front=card_data.front,
        back=card_data.back
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)

    return new_card


@app.put("/api/cards/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: int,
    card_data: CardCreate,
    db: Session = Depends(get_db)
):
    """Update a card."""
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.front = card_data.front
    card.back = card_data.back
    card.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(card)

    return card


@app.delete("/api/cards/{card_id}")
async def delete_card(card_id: int, db: Session = Depends(get_db)):
    """Delete a card."""
    card = db.query(Card).filter(Card.id == card_id).first()

    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    db.delete(card)
    db.commit()

    return {"message": "Card deleted successfully"}


# ============== STUDY & SRS ENDPOINTS ==============

@app.post("/api/study-sessions", response_model=StudySessionResponse)
async def start_study_session(
    session_data: StudySessionCreate,
    db: Session = Depends(get_db),
    user_id: int = 1
):
    """Start a new study session."""
    deck = db.query(Deck).filter(Deck.id == session_data.deck_id).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    new_session = StudySession(
        user_id=user_id,
        deck_id=session_data.deck_id
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return new_session


@app.post("/api/cards/{card_id}/review")
async def submit_card_review(
    card_id: int,
    review_data: CardReviewRequest,
    db: Session = Depends(get_db)
):
    """Submit a card review and update SRS data."""
    try:
        card = db.query(Card).filter(Card.id == card_id).first()

        if not card:
            raise HTTPException(status_code=404, detail="Card not found")

        study_session = db.query(StudySession).filter(
            StudySession.id == review_data.study_session_id
        ).first()

        if not study_session:
            raise HTTPException(status_code=404, detail="Study session not found")

        # Get or create review record
        existing_review = db.query(CardReview).filter(
            CardReview.card_id == card_id,
            CardReview.study_session_id == review_data.study_session_id
        ).first()

        if existing_review:
            # Update existing review
            ease_factor = existing_review.ease_factor
            repetitions = existing_review.repetitions
        else:
            # New review
            ease_factor = 2.5
            repetitions = 0

        # Calculate new interval using SM-2
        interval, new_ease, new_repetitions = sm2_engine.calculate_interval(
            repetitions, ease_factor, review_data.quality
        )

        next_review = sm2_engine.get_next_review_date(interval)

        # Create or update review record
        if existing_review:
            existing_review.quality = review_data.quality
            existing_review.ease_factor = new_ease
            existing_review.interval = interval
            existing_review.repetitions = new_repetitions
            existing_review.next_review_date = next_review
            existing_review.reviewed_at = datetime.utcnow()
        else:
            new_review = CardReview(
                card_id=card_id,
                study_session_id=review_data.study_session_id,
                quality=review_data.quality,
                ease_factor=new_ease,
                interval=interval,
                repetitions=new_repetitions,
                next_review_date=next_review
            )
            db.add(new_review)

        # Update study session stats
        study_session.cards_reviewed += 1
        if review_data.quality >= 3:
            study_session.cards_correct += 1

        db.commit()

        return {
            "message": "Review submitted",
            "next_review_date": next_review,
            "ease_factor": new_ease,
            "interval": interval
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/users/progress", response_model=UserProgressResponse)
async def get_user_progress(
    db: Session = Depends(get_db),
    user_id: int = 1
):
    """Get current user's study statistics."""
    # Total cards reviewed
    total_reviews = db.query(CardReview).join(
        StudySession
    ).filter(
        StudySession.user_id == user_id
    ).count()

    # Total study sessions
    total_sessions = db.query(StudySession).filter(
        StudySession.user_id == user_id
    ).count()

    # Average accuracy
    sessions = db.query(StudySession).filter(
        StudySession.user_id == user_id
    ).all()

    total_correct = sum(s.cards_correct for s in sessions)
    average_accuracy = (total_correct / total_reviews * 100) if total_reviews > 0 else 0

    # Decks studied
    decks_studied = len(set(s.deck_id for s in sessions))

    # Current streak (last session within 24 hours)
    latest_session = db.query(StudySession).filter(
        StudySession.user_id == user_id
    ).order_by(StudySession.started_at.desc()).first()

    current_streak = 1 if latest_session and (
        datetime.utcnow() - latest_session.started_at < timedelta(days=1)
    ) else 0

    return {
        "total_cards_reviewed": total_reviews,
        "total_sessions": total_sessions,
        "average_accuracy": round(average_accuracy, 2),
        "decks_studied": decks_studied,
        "current_streak": current_streak
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# Mount frontend React build - serve static files (at END to not block /api routes!)
# Use absolute path since app.py chdir to backend
import sys
from pathlib import Path

# Get the project root (parent of backend directory)
backend_dir = Path(__file__).parent
project_root = backend_dir.parent
frontend_build = project_root / "frontend" / "build"

print(f"🔍 Backend dir: {backend_dir}")
print(f"🔍 Project root: {project_root}")
print(f"🔍 Frontend build path: {frontend_build}")
print(f"🔍 Frontend build exists: {frontend_build.exists()}")
if frontend_build.exists():
    print(f"🔍 Frontend build contents: {list(frontend_build.iterdir())[:5]}")
    app.mount("/", StaticFiles(directory=str(frontend_build), html=True), name="frontend")
    print(f"✅ Frontend mounted successfully at /")
else:
    print(f"❌ Frontend build not found at {frontend_build}")
