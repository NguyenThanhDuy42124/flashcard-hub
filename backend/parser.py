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

    script_tags = soup.find_all('script')

    script_content = None
    for tag in script_tags:
        if tag.string and ('cardsData' in tag.string or 'flashcardsData' in tag.string or 'const' in tag.string):
            # Try to find array assignment (const/let/var flashcardsData = [{...}])
            pattern = r'(?:const|let|var)\s+\w+\s*=\s*(\s*\[\s*(?:/\*[\s\S]*?\*/|//[^\n]*\n|\s)*\{[\s\S]*?\}\s*\])\s*;'
            match = re.search(pattern, tag.string)
            if match:
                script_content = tag.string
                json_str = match.group(1)
                return json_str

    raise ValueError("Could not find an array of objects structure in any <script> tag")


def parse_cards_json(json_str: str) -> Dict[str, Any]:
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

    # Detect format: quiz or flashcard
    detected_type = "flashcard"
    validated_cards: List[Dict[str, Any]] = []

    for idx, card in enumerate(cards_data):
        if not isinstance(card, dict):
            raise ValueError(f"Card at index {idx} is not an object")

        # QUIZ format: question + options + correctAnswer + explanation (optional chapter/title)
        if 'question' in card and 'options' in card:
            detected_type = "quiz"
            question_text = str(card.get('question', '')).strip()
            options_obj = card.get('options', {}) or {}
            # Build options as multiline string for front
            option_lines = []
            for key, val in options_obj.items():
                option_lines.append(f"{key}. {val}")
            options_block = "\n".join(option_lines)
            correct = str(card.get('correctAnswer', '')).strip()
            explanation = str(card.get('explanation', '')).strip()

            front_text = question_text
            if options_block:
                front_text = f"{question_text}\n\n{options_block}"

            back_lines = []
            if correct:
                back_lines.append(f"Đáp án đúng: {correct}")
            if explanation:
                back_lines.append(explanation)
            back_text = "\n\n".join(back_lines).strip() or "Không có giải thích"

            validated_cards.append({
                'id': str(card.get('id', idx + 1)),
                'front': front_text,
                'back': back_text,
                'category': str(card.get('category', 'Quiz')),
                'title': question_text or None,
                'chapter': str(card.get('chapter', '')).strip() if card.get('chapter') else None
            })
            continue

        # FLASHCARD format (default): front/back required
        if 'front' not in card:
            raise ValueError(f"Card at index {idx} missing 'front' field")
        if 'back' not in card:
            raise ValueError(f"Card at index {idx} missing 'back' field")

        back_content = card['back']
        if isinstance(back_content, list):
            back_text = '\n'.join(str(item).strip() for item in back_content if item)
        else:
            back_text = str(back_content).strip()

        validated_cards.append({
            'id': str(card.get('id', idx + 1)),
            'front': str(card['front']).strip(),
            'back': back_text,
            'category': str(card.get('category', 'General')),
            'title': str(card.get('title', '')).strip() if card.get('title') else None,
            'chapter': str(card.get('chapter', '')).strip() if card.get('chapter') else None
        })

    if not validated_cards:
        raise ValueError("No valid cards found in cardsData array")

    return {"cards": validated_cards, "detected_type": detected_type}


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
    parsed = parse_cards_json(json_str)
    cards = parsed["cards"]
    detected_type = parsed.get("detected_type", "flashcard")

    # Extract title from HTML if available
    soup = BeautifulSoup(html_content, 'html.parser')
    title = "Imported Deck"

    # Try to find title in meta tags or title tag
    if soup.find('title'):
        title = soup.find('title').string or "Imported Deck"

    tag = "Quiz" if detected_type == "quiz" else "Flashcard"

    return {
        'title': title,
        'description': f"Imported from HTML file",
        'cards': cards,
        'card_count': len(cards),
        'tag': tag
    }
