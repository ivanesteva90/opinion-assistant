import re
from typing import Dict, List, Tuple

def paragraph_count(s: str) -> int:
    parts = [p for p in re.split(r"\n\s*\n", s.strip()) if p.strip()]
    return max(1, len(parts))

def sentence_count(s: str) -> int:
    # Basic sentence detection
    parts = re.findall(r"[^.!?]+[.!?]+", s.strip())
    return max(1, len(parts))

def verify_placeholders(out_masked: str, mapping: Dict[str, str]) -> List[str]:
    violations = []
    for token in mapping.keys():
        if token not in out_masked:
            violations.append(f"Missing placeholder: {token}")
    return violations

def validate_output(inp: str, out: str, mapping: Dict[str, str], 
                   min_chars: int, max_chars: int, 
                   keep_sentences: bool, keep_paragraphs: bool) -> List[str]:
    violations = []
    out_len = len(out.strip())
    
    if out_len < min_chars:
        violations.append("Output too short")
    if out_len > max_chars:
        violations.append("Output too long")

    if keep_sentences:
        sc_in = sentence_count(inp)
        sc_out = sentence_count(out)
        # Allow +/- 20% variance even with "keep" to allow flow, but warn if drastic
        if abs(sc_in - sc_out) > max(2, sc_in * 0.3): 
            violations.append(f"Sentence count mismatch ({sc_in} vs {sc_out})")

    if keep_paragraphs:
        pc_in = paragraph_count(inp)
        pc_out = paragraph_count(out)
        if pc_in != pc_out:
            violations.append(f"Paragraph count mismatch ({pc_in} vs {pc_out})")

    violations += verify_placeholders(out, mapping)

    return violations
