import re
from typing import Dict, Tuple

PLACEHOLDER = "[[P{}]]"

RE_CODEBLOCK = re.compile(r"```[\s\S]*?```", re.MULTILINE)
RE_URL = re.compile(r"https?://[^\s)>\]]+")
RE_EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")

# Relaxed protection: We disable number/quote/acronym protection to allow better rewriting
# RE_NUMBERISH = re.compile(r"(?<!\w)(?:\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)(?!\w)")
# RE_QUOTES = re.compile(r"“[^”]*”|\"[^\"]*\"|'[^']*'")
# RE_ACRONYM = re.compile(r"\b[A-Z][a-zA-Z\s-]+\(([A-Z]{2,})\)")

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

    # Order matters: Code blocks first to avoid matching URLs inside code
    text = _swap(RE_CODEBLOCK, text)
    text = _swap(RE_URL, text)
    text = _swap(RE_EMAIL, text)
    
    # Disabled protections for better flow
    # text = _swap(RE_ACRONYM, text)
    # text = _swap(RE_QUOTES, text)
    # text = _swap(RE_NUMBERISH, text)
    
    return text, mapping

def unprotect(text: str, mapping: Dict[str, str]) -> str:
    # Reverse sort by length to prevent partial replacement issues (though rare with P{})
    for token, original in mapping.items():
        text = text.replace(token, original)
    return text
