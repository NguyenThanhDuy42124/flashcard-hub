#!/usr/bin/env python3
"""Test study session endpoint."""
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# Setup database
from database import engine, SessionLocal
from models import Base, User, Deck, Card, StudySession

# Create tables
Base.metadata.create_all(bind=engine)

# Get session
db = SessionLocal()

print("🧪 Testing Study Session Endpoint")
print("=" * 50)

# Check if we have at least one deck
decks = db.query(Deck).all()
print(f"\n📊 Database Status:")
print(f"   - Total decks: {len(decks)}")

if not decks:
    print("\n⚠️ No decks found. Creating test deck...")
    
    # Create test user if needed
    user = db.query(User).first()
    if not user:
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash="fake_hash"
        )
        db.add(user)
        db.commit()
        print(f"✅ Created test user: {user.username}")
    
    # Create test deck
    test_deck = Deck(
        title="Test Deck for Study",
        description="Testing study functionality",
        owner_id=user.id,
        is_public=True,
        tag="test"
    )
    db.add(test_deck)
    db.flush()
    
    # Create a few test cards
    for i in range(3):
        card = Card(
            deck_id=test_deck.id,
            front=f"Question {i+1}",
            back=f"Answer {i+1}",
            title=f"Card {i+1}",
            chapter="Chapter 1"
        )
        db.add(card)
    
    db.commit()
    print(f"✅ Created test deck: {test_deck.title} (ID: {test_deck.id})")
    decks = [test_deck]

# Now test study session creation
if decks:
    test_deck = decks[0]
    print(f"\n📖 Test Deck: {test_deck.title} (ID: {test_deck.id})")
    print(f"   - Cards: {len(test_deck.cards)}")
    
    # Try creating a study session
    print(f"\n🔍 Testing study session creation...")
    try:
        user = db.query(User).first()
        study_session = StudySession(
            user_id=user.id,
            deck_id=test_deck.id
        )
        db.add(study_session)
        db.commit()
        db.refresh(study_session)
        
        print(f"✅ Study session created successfully!")
        print(f"   - Session ID: {study_session.id}")
        print(f"   - User ID: {study_session.user_id}")
        print(f"   - Deck ID: {study_session.deck_id}")
    except Exception as e:
        print(f"❌ Error creating study session: {e}")
        import traceback
        traceback.print_exc()

# Check StudySession table
study_sessions = db.query(StudySession).all()
print(f"\n📚 Total study sessions: {len(study_sessions)}")

db.close()

print("\n✅ Study endpoint test complete!")
print("\n📝 Next steps:")
print("  1. Restart your server")
print("  2. Open the Pterodactyl console")
print("  3. Look for logs like: '📚 Starting study session for deck_id=...'")
print("  4. Click on a deck to study and check if 'Not Found' error goes away")
