#!/usr/bin/env bash
# 🔴 FIX: "Not Found" error when clicking "ôn tập" (Study Mode)
# Root Cause: Old database missing title/chapter columns

echo "🔴 STUDY MODE FIX - 'Not Found' Error"
echo "======================================"
echo ""
echo "Error: When you click 'ôn tập' (Study) button, you see:"
echo "  {\"detail\":\"Not Found\"}"
echo ""

echo "📋 ROOT CAUSE:"
echo "The old database is missing the 'title' and 'chapter' columns"
echo "that were added in recent migrations."
echo ""

echo "✅ SOLUTION: Delete old database and restart"
echo "=============================================="
echo ""

echo "STEP 1: Stop the server on Pterodactyl"
echo "  - Click the 'Stop' button in Pterodactyl console"
echo ""

echo "STEP 2: Delete the old database"
echo "  - In Pterodactyl File Manager:"
echo "    - Navigate to /home/container/"
echo "    - Find flashcard_hub.db"
echo "    - DELETE it"
echo ""

echo "STEP 3: Update code to latest version"
echo "  Run in Pterodactyl console:"
echo "    cd /home/container"
echo "    git reset --hard"
echo "    git pull origin main"
echo ""

echo "STEP 4: Start the server"
echo "  - Click the 'Start' button in Pterodactyl console"
echo ""

echo "Server will automatically:"
echo "  ✅ Create fresh database with correct schema"
echo "  ✅ Run migrations automatically"
echo "  ✅ Add title/chapter columns"
echo "  ✅ Create sample decks"
echo ""

echo "✅ VERIFICATION:"
echo "  After restart, check Pterodactyl logs for:"
echo "    ✅ Database migrations completed"
echo "    ✅ Card columns verified"
echo "    ✅ Frontend mounted successfully"
echo ""

echo "  Then try clicking on a deck to study:"
echo "    - Browser console should NOT show '404 Not Found'"
echo "    - Flash cards should display"
echo "    - 'ôn tập' should work! ✅"
echo ""

echo "❌ IF STILL BROKEN:"
echo "  1. Make sure you deleted flash card_hub.db"
echo "  2. Check that you pulled latest code (commit 6e8d69f or newer)"
echo "  3. Restart the server again"
echo "  4. Check Pterodactyl logs for errors"
echo ""

echo "💡 HOW TO DELETE DATABASE:"
echo "  Option A (File Manager):"
echo "    1. Open Pterodactyl -> File Manager"
echo "    2. Navigate to /home/container/"
echo "    3. Find flashcard_hub.db file"
echo "    4. Click delete icon"
echo ""
echo "  Option B (Terminal):"
echo "    rm /home/container/flashcard_hub.db"
echo ""
