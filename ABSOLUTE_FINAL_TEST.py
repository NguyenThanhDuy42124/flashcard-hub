#!/usr/bin/env python3
"""
ABSOLUTE FINAL TEST - Shows clear PASS or FAIL
This is the definitive test to confirm the fix works.
"""
import requests
import sys
import json

print("\n" + "="*70)
print("FINAL FIX VERIFICATION TEST")
print("="*70 + "\n")

url = "http://localhost:25297/api/decks"
print(f"Testing: {url}\n")

try:
    response = requests.get(url, timeout=5)
    
    # Check status
    if response.status_code == 200:
        try:
            data = response.json()
            print("✅ PASS: API returned 200 OK")
            print(f"✅ PASS: Response is valid JSON")
            print(f"✅ PASS: No ResponseValidationError")
            print(f"\n📊 Response: {len(data) if isinstance(data, list) else 'dict'}")
            print("\n" + "="*70)
            print("🎉 FIX IS CONFIRMED WORKING")
            print("="*70)
            sys.exit(0)
        except:
            print("❌ FAIL: Response is not valid JSON")
            sys.exit(1)
    else:
        print(f"❌ FAIL: Status code {response.status_code}")
        if "ResponseValidationError" in response.text:
            print("❌ ResponseValidationError still present!")
        sys.exit(1)
        
except Exception as e:
    print(f"⚠️  Cannot connect or test: {e}")
    sys.exit(1)
