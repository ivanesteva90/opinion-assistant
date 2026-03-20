import re
from typing import Dict, Tuple

PLACEHOLDER = "[[P{}]]"

RE_CODEBLOCK = re.compile(r"```[\s\S]*?```", re.MULTILINE)
RE_URL = re.compile(r"https?://[^\s)>\]]+")
RE_EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
RE_NUMBERISH = re.compile(
    r"(?<!\w)(?:\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?%?|\d+(?:\.\d+)?%?|\d{4}-\d{2}-\d{2})(?!\w)"
)
RE_QUOTES = re.compile(r"“[^”]*”|\"[^\"]*\"|'[^']*'")
RE_ACRONYM = re.compile(r"\b[A-Z][a-zA-Z\s-]{0,40}\(([A-Z]{2,})\)")
RE_CPT_ICD = re.compile(r"\b(?:ICD|CPT)[-\s]?\d+[A-Za-z0-9.-]*\b", re.IGNORECASE)

# Protection strategy:
# keep factual anchors untouched (numbers, quoted phrases, coded terms)
# while still allowing the model to rewrite sentence flow.

def protect(text: str) -> Tuple[str, Dict[str, str]]:
    mapping: Dict[str, str] = {}
    idx = 0

    def _swap(regex, s):
        nonlocal idx, mapping
        def repl(m):
            nonlocal idx, mapping
            token = PLACEHOLDER.format(idx)
            mapping[token] = m.group(0)
            idx += 1
            return token
        return regex.sub(repl, s)

    # Order matters: broad spans first to avoid partial replacement conflicts.
    text = _swap(RE_CODEBLOCK, text)
    text = _swap(RE_URL, text)
    text = _swap(RE_EMAIL, text)
    text = _swap(RE_CPT_ICD, text)
    text = _swap(RE_ACRONYM, text)
    text = _swap(RE_QUOTES, text)
    text = _swap(RE_NUMBERISH, text)
    
    return text, mapping

def unprotect(text: str, mapping: Dict[str, str]) -> str:
    # Replace longer tokens first in case a short token is substring of another.
    for token, original in sorted(mapping.items(), key=lambda item: len(item[0]), reverse=True):
        text = text.replace(token, original)
    return text
