#!/usr/bin/env bash
# Deployment guide for colored logging and status endpoint

echo "📋 DEPLOYMENT GUIDE: Colored Logging + Server Status"
echo "=================================================="
echo ""

echo "1️⃣ STEP 1: Sync latest code on Pterodactyl"
echo "Run in Pterodactyl console:"
echo "  ==> Syncing code from GitHub..."
echo "  git reset --hard && git pull origin main"
echo ""

echo "2️⃣ STEP 2: Install new dependencies on Pterodactyl"
echo "Run in Pterodactyl console:"
echo "  pip install -r backend/requirements-prod.txt --no-cache-dir"
echo ""

echo "3️⃣ STEP 3: Restart the server on Pterodactyl"
echo "Use the restart button in Pterodactyl panel"
echo ""

echo "4️⃣ STEP 4: Check the COLORED LOGS"
echo "Look for messages like:"
echo "  ✅ 115.73.23.229:54709 - \"GET /api/decks HTTP/1.1\" 200 (0.045s)"
echo "  ✅ Database migrations completed"
echo "  ✅ Found 3 public decks"
echo ""

echo "5️⃣ STEP 5: Test the new /api/server/status endpoint"
echo "Open in your browser:"
echo "  https://your-domain/api/server/status"
echo ""
echo "Or use curl:"
echo "  curl https://your-domain/api/server/status | jq"
echo ""

echo "Expected response:"
echo "  {"
echo "    \"status\": \"operational\","
echo "    \"timestamp\": \"2026-03-31T04:12:15.123456\","
echo "    \"database\": {"
echo "      \"total_users\": 1,"
echo "      \"total_decks\": 3,"
echo "      \"public_decks\": 3,"
echo "      \"total_cards\": 163"
echo "    },"
echo "    \"version\": \"1.0.0\""
echo "  }"
echo ""

echo "6️⃣ NEW FEATURES:"
echo "  ✅ All HTTP requests now logged with colors"
echo "  ✅ Status codes color-coded (✅ 200, ⚠️ 404, ❌ 500)"
echo "  ✅ Database operations now logged in detail"
echo "  ✅ Server status endpoint for monitoring"
echo ""

echo "7️⃣ IF STILL SEEING 'FAIL TO FETCH':
echo "  - Check server logs for detailed error messages"
echo "  - Look for 404/500 status codes in colored logs"
echo "  - Check browser DevTools Network tab for exact error"
echo "  - Verify /api/decks endpoint is returning data"
echo ""
