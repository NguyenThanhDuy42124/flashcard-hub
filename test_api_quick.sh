#!/bin/bash
# Quick API test - run this to verify the fix works
# Usage: bash test_api_quick.sh [port]
# Default port: 25297

PORT=${1:-25297}
SERVER="http://localhost:$PORT"

echo "Testing /api/decks endpoint..."
echo "Server: $SERVER"
echo ""

# Make the request and show result
curl -s "$SERVER/api/decks" | head -100

echo ""
echo ""
if curl -s "$SERVER/api/decks" >/dev/null 2>&1; then
    echo "✅ API is responding (no connection error)"
else
    echo "⚠️ Could not connect to server"
fi
