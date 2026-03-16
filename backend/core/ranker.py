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
    # Base Score: Similarity (0.0 - 100.0)
    score = 100.0 * sim
    
    # Penalize Boilerplate heavily (Data Inverse Strategy)
    # Detectors rely on these n-grams, so we must avoid them at all costs.
    score -= 25.0 * len(boiler_hits) 
    
    # Reward Burstiness (Sentence Length Variance)
    # High variance = High Burstiness = Human.
    # We increase the reward cap to prioritize choppy/varied flow.
    variance_reward = min(25.0, sentence_len_variance(out) / 15.0)
    score += variance_reward

    # Penalize Violations
    score -= 20.0 * len(violations)
    
    # Penalize extreme similarity (likely no change)
    if sim > 0.99:
        score -= 50.0 # Force it to pick something else if possible

    return score, violations
