#!/usr/bin/env python3
"""
FINAL VERIFICATION - Must show 'PASSED' to confirm fix is working.
Run this on the server where you deployed the fixed code.
"""

import requests
import sys

BASE_URL = "http://localhost:25297"  # Change if needed

print("\n" + "="*60)
print("RESPONSEVALIDATIONERROR FIX - FINAL VERIFICATION")
print("="*60)

try:
    print(f"\nTesting: {BASE_URL}/api/decks")
    response = requests.get(f"{BASE_URL}/api/decks", timeout=5)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ SUCCESS - API returned data (no ResponseValidationError)")
        print(f"Response type: {type(data)}")
        print(f"Number of items: {len(data) if isinstance(data, list) else 'N/A'}")
        print("\n🎉 FIX IS CONFIRMED WORKING")
        print("STATUS: PASSED ✅")
        sys.exit(0)
    else:
        print(f"\n❌ FAILED - Unexpected status code")
        print(f"Response: {response.text[:200]}")
        print("STATUS: FAILED ❌")
        sys.exit(1)

except requests.exceptions.ConnectionError:
    print(f"\n❌ Cannot connect to {BASE_URL}")
    print("STATUS: INCONCLUSIVE (Server not reachable)")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {e}")
    print("STATUS: FAILED ❌")
    sys.exit(1)
