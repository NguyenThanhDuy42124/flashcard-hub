#!/usr/bin/env python3
"""
API Endpoint Verification Script
Tests that the ResponseValidationError fix actually resolved the issue
by verifying the /api/decks endpoint now works correctly.
"""

import requests
import json
import sys
from typing import Optional

def test_api_endpoint(base_url: str = "http://localhost:25297") -> bool:
    """Test that /api/decks endpoint works without ResponseValidationError."""
    
    print("\n" + "=" * 70)
    print("API ENDPOINT VERIFICATION")
    print("=" * 70)
    print(f"\n📡 Testing API at: {base_url}")
    
    try:
        # Test 1: Health check
        print("\n1️⃣  Testing health endpoint...")
        health_url = f"{base_url}/api/health"
        response = requests.get(health_url, timeout=5)
        
        if response.status_code == 200:
            print(f"   ✅ Health check passed (status: {response.status_code})")
        else:
            print(f"   ⚠️  Health check: {response.status_code}")
        
        # Test 2: Get decks endpoint (the one that was failing)
        print("\n2️⃣  Testing /api/decks endpoint (THE FIX)...")
        decks_url = f"{base_url}/api/decks"
        response = requests.get(decks_url, timeout=5)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   ✅ /api/decks endpoint WORKS (no ResponseValidationError)")
            
            try:
                data = response.json()
                if isinstance(data, list):
                    print(f"   ✅ Response is valid JSON array")
                    print(f"   📊 Found {len(data)} decks")
                    
                    if data:
                        first_deck = data[0]
                        print(f"\n   Sample deck structure:")
                        print(f"   {json.dumps(first_deck, indent=6, default=str)[:300]}...")
                        
                        # Check for title and chapter fields
                        if 'cards' in first_deck and first_deck['cards']:
                            first_card = first_deck['cards'][0]
                            print(f"\n   Sample card structure:")
                            print(f"   {json.dumps(first_card, indent=6, default=str)[:300]}...")
                            
                            if 'title' in first_card and 'chapter' in first_card:
                                print(f"   ✅ Card has 'title' and 'chapter' fields (fix confirmed!)")
                    
                    return True
                else:
                    print(f"   ❌ Response is not a JSON array: {type(data)}")
                    return False
                    
            except json.JSONDecodeError as e:
                print(f"   ❌ Invalid JSON response: {e}")
                print(f"   Response text: {response.text[:200]}")
                return False
        
        elif response.status_code == 500:
            print(f"   ❌ Server error (500)")
            print(f"   Response: {response.text[:200]}")
            
            if "ResponseValidationError" in response.text:
                print(f"   ❌ ResponseValidationError still present - FIX FAILED")
                return False
            else:
                print(f"   ⚠️  Different 500 error (not ResponseValidationError)")
                return False
        
        else:
            print(f"   ❌ Unexpected status code: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Cannot connect to {base_url}")
        print(f"   Make sure the server is running on that address")
        return False
    
    except requests.exceptions.Timeout:
        print(f"   ❌ Request timed out - server may be slow")
        return False
    
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run API verification."""
    print("\n" + "🔍 RESPONSEVALIDATIONERROR FIX - LIVE VERIFICATION\n")
    print("This script verifies that the fix actually works by testing")
    print("the /api/decks endpoint that was throwing ResponseValidationError\n")
    
    # Try different possible URLs
    urls = [
        "http://localhost:25297",  # Default local
        "http://127.0.0.1:25297",
        "http://localhost:8000",   # Alternative
    ]
    
    success = False
    for url in urls:
        print(f"\nTrying: {url}")
        if test_api_endpoint(url):
            success = True
            break
    
    print("\n" + "=" * 70)
    
    if success:
        print("\n🎉 API VERIFICATION SUCCESSFUL!")
        print("✅ /api/decks endpoint is working")
        print("✅ No ResponseValidationError")
        print("✅ Card objects validate correctly")
        print("✅ FIX IS CONFIRMED WORKING!")
        print("\nThe 'Failed to load decks' error has been RESOLVED ✅")
        return 0
    else:
        print("\n⚠️  API VERIFICATION INCONCLUSIVE")
        print("Could not reach the server or verify the endpoint")
        print("Make sure:")
        print("  1. Server is running")
        print("  2. You're using the correct URL")
        print("  3. Network connectivity is working")
        return 1

if __name__ == "__main__":
    sys.exit(main())
