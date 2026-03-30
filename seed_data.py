"""
Seed script - Create sample data for testing Flashcard Hub
"""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from database import SessionLocal
from models import User, Deck, Card, StudySession, CardReview
from datetime import datetime, timedelta

def seed_database():
    """Create sample data for testing."""
    db = SessionLocal()
    
    try:
        # Create sample user
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash="hashed_password_123"
        )
        db.add(user)
        db.commit()
        print(f"✅ Created user: {user.username}")
        
        # Create sample decks
        deck1 = Deck(
            title="English Vocabulary",
            description="Learn common English words",
            user_id=user.id,
            tag="english"
        )
        deck2 = Deck(
            title="Math Formulas",
            description="Essential math formulas",
            user_id=user.id,
            tag="math"
        )
        db.add_all([deck1, deck2])
        db.commit()
        print(f"✅ Created decks: {deck1.title}, {deck2.title}")
        
        # Create sample cards for English deck
        cards_data = [
            {"front": "Hello", "back": "Xin chào", "deck_id": deck1.id},
            {"front": "Goodbye", "back": "Tạm biệt", "deck_id": deck1.id},
            {"front": "Thank you", "back": "Cảm ơn bạn", "deck_id": deck1.id},
            {"front": "Please", "back": "Vui lòng", "deck_id": deck1.id},
            {"front": "Water", "back": "Nước", "deck_id": deck1.id},
        ]
        
        for card_data in cards_data:
            card = Card(
                front=card_data["front"],
                back=card_data["back"],
                deck_id=card_data["deck_id"]
            )
            db.add(card)
        db.commit()
        print(f"✅ Created 5 cards in English deck")
        
        # Create sample cards for Math deck
        math_cards = [
            {"front": "Area of circle", "back": "πr²", "deck_id": deck2.id},
            {"front": "Pythagorean theorem", "back": "a² + b² = c²", "deck_id": deck2.id},
            {"front": "Quadratic formula", "back": "x = (-b ± √(b²-4ac)) / 2a", "deck_id": deck2.id},
        ]
        
        for card_data in math_cards:
            card = Card(
                front=card_data["front"],
                back=card_data["back"],
                deck_id=card_data["deck_id"]
            )
            db.add(card)
        db.commit()
        print(f"✅ Created 3 cards in Math deck")
        
        # Create study session
        study_session = StudySession(
            user_id=user.id,
            deck_id=deck1.id,
            cards_reviewed=2,
            duration_minutes=15
        )
        db.add(study_session)
        db.commit()
        print(f"✅ Created study session")
        
        # Create card reviews
        cards = db.query(Card).filter(Card.deck_id == deck1.id).limit(2).all()
        for i, card in enumerate(cards):
            review = CardReview(
                card_id=card.id,
                study_session_id=study_session.id,
                quality=4 - i,
                ease_factor=2.5,
                interval=3 + i,
                repetitions=1 + i,
                next_review_date=datetime.now() + timedelta(days=3 + i)
            )
            db.add(review)
        db.commit()
        print(f"✅ Created card reviews")
        
        print("\n" + "="*60)
        print("🎉 Sample data created successfully!")
        print("="*60)
        print(f"\nYou can now:")
        print(f"1. View decks: http://localhost:3000")
        print(f"2. Study English Vocabulary deck")
        print(f"3. See sample cards and reviews")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
