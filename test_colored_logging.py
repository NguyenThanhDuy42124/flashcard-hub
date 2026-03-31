#!/usr/bin/env python3
"""Test colored logging with Rich library."""
import sys
import logging
from pathlib import Path
from rich.logging import RichHandler
from rich.console import Console

# Setup Rich logging
console = Console()
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    handlers=[RichHandler(console=console, rich_tracebacks=True)]
)
logger = logging.getLogger("test")

# Test various log levels with colors
print("🧪 Testing Rich colored logging...\n")

logger.info("✅ This is an INFO message (green)")
logger.warning("⚠️ This is a WARNING message (yellow)")
logger.error("❌ This is an ERROR message (red)")
logger.debug("🔍 This is a DEBUG message (blue)")

# Simulate HTTP logging
print("\n📊 Simulated HTTP Request Logs:")
logger.info("✅ 127.0.0.1 - \"GET /api/decks HTTP/1.1\" 200 (0.045s)")
logger.info("✅ 127.0.0.1 - \"POST /api/decks/create HTTP/1.1\" 201 (0.120s)")
logger.info("⚠️ 127.0.0.1 - \"GET /api/invalid HTTP/1.1\" 404 (0.012s)")
logger.info("❌ 127.0.0.1 - \"PUT /api/decks HTTP/1.1\" 500 (0.089s)")

# Simulate database logs
print("\n📋 Simulated Database Request Logs:")
logger.info("📋 Fetching decks: skip=0, limit=10, tag=None")
logger.info("✅ Found 3 public decks")
logger.info("  - Deck: Spanish Vocabulary (ID: 1, Cards: 50)")
logger.info("  - Deck: Japanese Hiragana (ID: 2, Cards: 71)")
logger.info("  - Deck: French Grammar (ID: 3, Cards: 42)")

# Simulate server status
print("\n✅ Server status request:")
logger.info("📊 Server status requested")
logger.info("✅ Server status: 3 decks, 163 cards, 1 user")

print("\n✅ All logging tests completed!")
