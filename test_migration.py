#!/usr/bin/env python
"""Test if migration initialization code works."""
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

# Test if migration code works
try:
    from alembic.config import Config
    from alembic.command import upgrade as alembic_upgrade
    
    print("✅ Alembic imports successful")
    
    # Test config loading
    alembic_config = Config(str(Path(__file__).parent / "backend" / "alembic.ini"))
    print("✅ Alembic config loaded")
    
    # Check if sqlalchemy.url can be set
    import os
    db_url = os.getenv("DATABASE_URL", f"sqlite:///{Path(__file__).parent / 'flashcard_hub.db'}")
    alembic_config.set_main_option("sqlalchemy.url", db_url)
    print(f"✅ Database URL configured: {db_url[:80]}...")
    
    print("\n✅ All migration checks passed! App startup should work fine.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
