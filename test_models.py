#!/usr/bin/env python
"""Test models and schema imports."""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

try:
    print("Testing imports...")
    from models import Card, Deck, User
    print("✅ Models imported successfully")
    
    from schemas import CardResponse, DeckResponse
    print("✅ Schemas imported successfully")
    
    from database import get_db, engine, Base
    print("✅ Database imported successfully")
    
    # Test CardResponse can handle missing fields
    print("\nTesting CardResponse validation...")
    test_data = {
        "id": 1,
        "deck_id": 1,
        "front": "Test front",
        "back": "Test back",
        "title": None,
        "chapter": None,
        "created_at": "2026-03-31T00:00:00",
        "updated_at": "2026-03-31T00:00:00"
    }
    
    card_response = CardResponse(**test_data)
    print(f"✅ CardResponse created: {card_response}")
    print(f"   - title: {card_response.title}")
    print(f"   - chapter: {card_response.chapter}")
    
    print("\n✅ All tests passed! Models and schemas work correctly.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
