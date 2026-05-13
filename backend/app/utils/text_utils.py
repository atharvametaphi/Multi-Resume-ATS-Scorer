from __future__ import annotations

import re
from collections.abc import Iterable


def normalize_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def to_unique_preserving_order(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for raw_value in values:
        value = raw_value.strip()
        if not value:
            continue
        key = value.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(value)
    return result


def extract_years_of_experience(text: str) -> float:
    matches = re.findall(r"(\d+(?:\.\d+)?)\+?\s+years?", text.lower())
    if not matches:
        return 0.0
    values = [float(value) for value in matches]
    return max(values)

