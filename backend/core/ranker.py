from typing import Dict, List, Tuple
from core.metrics import paragraph_count, sentence_count, sentence_len_variance, new_absolutes, placeholders_missing

def score_candidate(inp: str, out: str, sim: float, boiler_hits: List[str], 
                    mapping: Dict[str, str], 
                    min_chars: int, max_chars: int, 
                    keep_sentence: bool, keep_paragraphs: bool) -> Tuple[float, List[str]]:

    violations = []
    out_len = len(out.strip())
    
    # Length checks
    if out_len < min_chars: violations.append("too_short")
    if out_len > max_chars: violations.append("too_long")

    # Structure checks
    if keep_sentence:
        s_in = sentence_count(inp)
        s_out = sentence_count(out)
        if abs(s_in - s_out) > max(2, s_in * 0.2): # Allow 20% variance
            violations.append(f"sentence_mismatch ({s_in}->{s_out})")

    if keep_paragraphs and paragraph_count(out) != paragraph_count(inp):
        violations.append("paragraph_mismatch")

    # Data integrity
    missing = placeholders_missing(out, mapping)
    if missing:
        violations.append("placeholder_missing:" + ",".join(missing))

    # New absolute claims
    abs_new = new_absolutes(inp, out)
    if abs_new:
        violations.append("new_absolutes:" + ",".join(abs_new))

    # Scoring Logic
    # Emphasize fidelity first, then readability/diversity.
    score = 110.0 * sim

    # Boilerplate can raise detector risk and reduce quality.
    score -= 10.0 * len(boiler_hits)

    # Encourage moderate rhythm variation (too flat sounds robotic, too extreme hurts quality).
    var = sentence_len_variance(out)
    if var < 40:
        score -= 10.0
    elif 40 <= var <= 380:
        score += 8.0
    else:
        score -= 4.0

    # Penalize structural/data violations heavily.
    score -= 22.0 * len(violations)

    # Penalize no-op rewrites while still allowing close paraphrases.
    if sim > 0.995:
        score -= 18.0

    return score, violations
