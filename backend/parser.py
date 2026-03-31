"""HTML file parser for extracting flashcard data."""
import re
import json
import json5  # Để parse JavaScript objects
from typing import List, Dict, Any, Optional, Union
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


def try_parse_raw_json(payload: str) -> Optional[Union[List[Any], Dict[str, Any]]]:
    """Parse raw content that may already be JSON/JSON5 instead of HTML."""
    try:
        data = json5.loads(payload)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            if 'cards' in data and isinstance(data['cards'], list):
                return data['cards']
            # Also accept a single-object wrapper to keep behavior lenient
            if all(k in data for k in ('question', 'options')) or all(k in data for k in ('front', 'back')):
                return [data]
    except Exception:
        return None
    return None


def parse_cards_json(json_input: Union[str, List[Any], Dict[str, Any]]) -> Dict[str, Any]:
    """
    Parse and validate cards JSON payload.

    Accepts either a JSON string or already-parsed list/dict.
    """
    if isinstance(json_input, (list, dict)):
        cards_data = json_input
    else:
        try:
            cards_data = json5.loads(json_input)
        except Exception:
            try:
                cards_data = json.loads(json_input)
            except json.JSONDecodeError as e2:
                raise ValueError(f"Invalid JSON in cardsData: {str(e2)}")

    # Unwrap if provided as object with cards
    if isinstance(cards_data, dict) and 'cards' in cards_data and isinstance(cards_data['cards'], list):
        cards_data = cards_data['cards']

    if not isinstance(cards_data, list):
        raise ValueError("cardsData must be an array")

    # Detect format: quiz or flashcard
    detected_type = "flashcard"
    validated_cards: List[Dict[str, Any]] = []

    for idx, card in enumerate(cards_data):
        if not isinstance(card, dict):
            raise ValueError(f"Card at index {idx} is not an object")

        # QUIZ format: question + options + correct/correctAnswer + explanation (optional chapter/title)
        if 'question' in card and 'options' in card:
            detected_type = "quiz"
            question_text = str(card.get('question', '')).strip()
            options_raw = card.get('options', {}) or {}

            # Normalize options: accept array or object, convert array -> {A: text}
            options_obj: Dict[str, str] = {}
            if isinstance(options_raw, list):
                for opt_idx, opt_val in enumerate(options_raw):
                    key = chr(ord('A') + opt_idx)
                    options_obj[key] = str(opt_val).strip()
            elif isinstance(options_raw, dict):
                options_obj = {str(k): str(v).strip() for k, v in options_raw.items()}
            else:
                raise ValueError(f"Card at index {idx} has unsupported options format")

            # Normalize correct answer: accept index (0-based or 1-based), digit-string, or letter
            correct_raw = card.get('correctAnswer', card.get('correct'))
            correct_key = None
            if isinstance(correct_raw, (int, float)):
                idx_num = int(correct_raw)
                # Try 0-based first
                if 0 <= idx_num < len(options_obj):
                    correct_key = chr(ord('A') + idx_num)
                # Fallback 1-based if needed
                elif 1 <= idx_num <= len(options_obj):
                    correct_key = chr(ord('A') + idx_num - 1)
            elif isinstance(correct_raw, str):
                corrected = correct_raw.strip()
                if corrected.isdigit():
                    idx_num = int(corrected)
                    if 0 <= idx_num < len(options_obj):
                        correct_key = chr(ord('A') + idx_num)
                    elif 1 <= idx_num <= len(options_obj):
                        correct_key = chr(ord('A') + idx_num - 1)
                elif len(corrected) == 1:
                    correct_key = corrected.upper()
                else:
                    correct_key = corrected

            explanation = str(card.get('explanation', '')).strip()
            # Store quiz metadata in back as JSON for frontend to render MCQ
            meta_payload = {
                "type": "quiz",
                "options": options_obj,
                "correct": correct_key,
                "explanation": explanation,
            }
            back_text = "__QUIZ__::" + json.dumps(meta_payload, ensure_ascii=False)

            validated_cards.append({
                'id': str(card.get('id', idx + 1)),
                'front': question_text,
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
    # 1) Try direct JSON (paste raw array/object)
    direct_payload = try_parse_raw_json(html_content)

    if direct_payload is not None:
        parsed = parse_cards_json(direct_payload)
    else:
        # 2) Extract JSON from HTML <script>
        json_str = extract_json_from_html(html_content)
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
