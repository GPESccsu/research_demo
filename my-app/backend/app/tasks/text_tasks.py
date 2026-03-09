from typing import Any


def clean_text(text: Any) -> str:
    """Convert input to text and trim surrounding whitespace."""
    if text is None:
        return ""
    return str(text).strip()


def normalize_whitespace(text: Any) -> str:
    """Collapse all whitespace runs into single spaces."""
    cleaned = clean_text(text)
    return " ".join(cleaned.split())
