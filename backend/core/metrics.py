import re
from typing import Dict, List

ABSOLUTES = ["always", "never", "every", "all", "only", "must", "undoubtedly", "unquestionably"]

def paragraph_count(s: str) -> int:
    parts = [p for p in re.split(r"\n\s*\n", s.strip()) if p.strip()]
    return max(1, len(parts))

def sentence_spans(s: str) -> List[str]:
    # Robust sentence splitting
    spans = re.findall(r"[^.!?]+[.!?]+", s.strip())
    return spans if spans else [s.strip()]

def sentence_count(s: str) -> int:
    return len(sentence_spans(s))

def sentence_len_variance(s: str) -> float:
    lens = [len(x.strip()) for x in sentence_spans(s)]
    if len(lens) <= 1:
        return 0.0
    mean = sum(lens) / len(lens)
    var = sum((x - mean) ** 2 for x in lens) / (len(lens) - 1)
    return float(var)

def new_absolutes(inp: str, out: str) -> List[str]:
    inp_l = inp.lower()
    out_l = out.lower()
    return [w for w in ABSOLUTES if (w in out_l and w not in inp_l)]

def placeholders_missing(out: str, mapping: Dict[str, str]) -> List[str]:
    return [tok for tok in mapping.keys() if tok not in out]
