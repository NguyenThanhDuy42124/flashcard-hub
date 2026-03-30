"""HTML file parser for extracting flashcard data."""
import re
import json
import json5  # Để parse JavaScript objects
from typing import List, Dict, Any
from bs4 import BeautifulSoup
from pydantic import ValidationError


def extract_json_from_html(html_content: str) -> str:
    """
    Extract JSON data from HTML file's script tag.

    Args:
        html_content: Raw HTML content

    Returns:
        JSON string extracted from script tag
    """
    # Parse HTML
    soup = BeautifulSoup(html_content, 'html.parser')

    # Find script tag with type="text/babel"
    script_tag = soup.find('script', {'type': 'text/babel'})

    if not script_tag:
        raise ValueError("No <script type='text/babel'> tag found in HTML")

    script_content = script_tag.string

    if not script_content:
        raise ValueError("Script tag is empty")

    # Use regex to extract cardsData JSON array
    pattern = r'const\s+cardsData\s*=\s*(\[[\s\S]*?\]);'
    match = re.search(pattern, script_content)

    if not match:
        raise ValueError("Could not find cardsData array in script")

    json_str = match.group(1)
    
    return json_str


def parse_cards_json(json_str: str) -> List[Dict[str, str]]:
    """
    Parse and validate cards JSON string.

    Args:
        json_str: JSON string containing cards array

    Returns:
        List of validated card dictionaries
    """
    try:
        # Thử json5 trước - nó parse JavaScript objects hoàn hảo
        cards_data = json5.loads(json_str)
    except Exception as e:
        # Fallback to standard json
        try:
            cards_data = json.loads(json_str)
        except json.JSONDecodeError as e2:
            raise ValueError(f"Invalid JSON in cardsData: {str(e2)}")

    if not isinstance(cards_data, list):
        raise ValueError("cardsData must be an array")

    # Validate each card
    validated_cards = []
    for idx, card in enumerate(cards_data):
        if not isinstance(card, dict):
            raise ValueError(f"Card at index {idx} is not an object")

        # front và back là bắt buộc, id có thể auto-generate
        if 'front' not in card:
            raise ValueError(f"Card at index {idx} missing 'front' field")

        if 'back' not in card:
            raise ValueError(f"Card at index {idx} missing 'back' field")

        # Handle back field - can be string or array
        back_content = card['back']
        if isinstance(back_content, list):
            # If back is array, join with newlines
            back_text = '\n'.join(str(item).strip() for item in back_content if item)
        else:
            back_text = str(back_content).strip()

        validated_cards.append({
            'id': str(card.get('id', idx + 1)),
            'front': str(card['front']).strip(),
            'back': back_text,
            'category': str(card.get('category', 'General'))
        })

    if not validated_cards:
        raise ValueError("No valid cards found in cardsData array")

    return validated_cards


def parse_html_file(html_content: str) -> Dict[str, Any]:
    """
    Main parser function to extract cards data from HTML file.

    Args:
        html_content: Raw HTML content from uploaded file

    Returns:
        Dictionary with parsed deck data
    """
    # Extract JSON string
    json_str = extract_json_from_html(html_content)

    # Parse and validate cards
    cards = parse_cards_json(json_str)

    # Extract title from HTML if available
    soup = BeautifulSoup(html_content, 'html.parser')
    title = "Imported Deck"

    # Try to find title in meta tags or title tag
    if soup.find('title'):
        title = soup.find('title').string or "Imported Deck"

    return {
        'title': title,
        'description': f"Imported from HTML file",
        'cards': cards,
        'card_count': len(cards)
    }
