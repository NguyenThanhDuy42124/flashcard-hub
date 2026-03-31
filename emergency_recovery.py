#!/usr/bin/env python3
"""
Emergency recovery script for Pterodactyl deployment.
Run this on the SERVER if normal deployment fails.

This script provides several recovery options:
1. Force re-run of migrations
2. Reset alembic_version table
3. Manually apply migrations
"""

import os
import sys
from pathlib import Path

def print_menu():
    print("\n" + "=" * 70)
    print("FLASHCARD HUB - EMERGENCY RECOVERY SCRIPT")
    print("=" * 70)
    print("\nChoose an option:")
    print("1. View current migration state")
    print("2. Force upgrade to latest migration")
    print("3. Reset alembic_version table (warning: destructive)")
    print("4. Check database schema")
    print("5. Run verification tests")
    print("0. Exit")
    print("\n" + "=" * 70)
    return input("Select option (0-5): ").strip()

def view_migration_state():
    """Show current migration status."""
    print("\n🔍 Current Migration State:")
    print("-" * 70)
    
    try:
        # Try to get alembic current version
        os.system("cd backend && alembic current")
        print("\n📋 Migration History:")
        os.system("cd backend && alembic history")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("   Make sure you're in the project root directory")

def force_upgrade():
    """Force run upgrades."""
    print("\n🔧 Forcing Migration Upgrade:")
    print("-" * 70)
    
    try:
        os.system("cd backend && alembic upgrade head")
        print("\n✅ Migration upgrade completed")
    except Exception as e:
        print(f"❌ Error: {e}")

def reset_alembic():
    """Reset alembic_version table (destructive)."""
    print("\n⚠️  WARNING: This will reset migration tracking!")
    print("   The database schema will remain unchanged")
    print("   But Alembic will re-apply all migrations")
    response = input("\nContinue? (yes/no): ").strip().lower()
    
    if response != 'yes':
        print("❌ Cancelled")
        return
    
    print("\n🔧 Resetting Alembic State:")
    print("-" * 70)
    
    try:
        # Get database URL from environment or use default
        db_url = os.environ.get("DATABASE_URL", "sqlite:///flashcard_hub.db")
        
        # This would need proper implementation with SQLAlchemy
        print(f"Database: {db_url}")
        print("\nTo manually reset, connect to database and run:")
        print("  DELETE FROM alembic_version;")
        print("\nThen run:")
        print("  cd backend && alembic upgrade head")
    except Exception as e:
        print(f"❌ Error: {e}")

def check_schema():
    """Check database schema."""
    print("\n📊 Checking Database Schema:")
    print("-" * 70)
    
    try:
        db_path = "../flashcard_hub.db"  # Relative to backend
        
        if not Path(db_path).exists():
            print(f"❌ Database file not found at {db_path}")
            return
        
        import sqlite3
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if cards table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cards'")
        if not cursor.fetchone():
            print("❌ Cards table not found!")
            conn.close()
            return
        
        print("✅ Cards table exists\n")
        
        # Check columns
        print("Card columns:")
        cursor.execute("PRAGMA table_info(cards)")
        for column in cursor.fetchall():
            col_id, col_name, col_type, not_null, col_default, col_pk = column
            nullable = "nullable" if not_null == 0 else "NOT NULL"
            print(f"  {col_name:15} {col_type:15} {nullable}")
        
        # Check for required columns
        cursor.execute("PRAGMA table_info(cards)")
        columns = {col[1] for col in cursor.fetchall()}
        
        print("\n✅ Status:")
        required = ['title', 'chapter']
        for col in required:
            status = "✅" if col in columns else "❌"
            print(f"  {status} Column '{col}' present")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

def run_verification():
    """Run verification tests."""
    print("\n🧪 Running Verification Tests:")
    print("-" * 70)
    
    try:
        os.system("python ../verify_migrations.py")
        print("\n" + "-" * 70)
        os.system("python ../integration_tests.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Main program loop."""
    print("\n"+ "🆘 EMERGENCY RECOVERY - Flashcard Hub\n")
    print("This script helps diagnose and fix deployment issues.")
    print("Run this from the project root directory.\n")
    
    while True:
        choice = print_menu()
        
        if choice == "0":
            print("\n👋 Exiting...")
            break
        elif choice == "1":
            view_migration_state()
        elif choice == "2":
            force_upgrade()
        elif choice == "3":
            reset_alembic()
        elif choice == "4":
            check_schema()
        elif choice == "5":
            run_verification()
        else:
            print("❌ Invalid option")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Cancelled")
        sys.exit(0)
