import math
import re
from collections import Counter
from typing import Dict, List, Tuple


AI_TRANSITIONS = {
    "furthermore",
    "moreover",
    "additionally",
    "therefore",
    "thus",
    "hence",
    "in conclusion",
    "it is important to note",
    "notably",
    "overall",
    "ultimately",
}

AI_HEDGES = {
    "likely",
    "appears",
    "suggests",
    "seems",
    "may",
    "could",
    "potentially",
    "arguably",
}

HUMAN_MARKERS = {
    "i",
    "we",
    "my",
    "our",
    "honestly",
    "frankly",
    "actually",
    "personally",
}

CONTRACTIONS = {
    "can't",
    "won't",
    "don't",
    "didn't",
    "it's",
    "that's",
    "there's",
    "we're",
    "i'm",
    "they're",
}

GENERIC_AI_PHRASES = {
    "plays a key role",
    "is essential for",
    "in order to",
    "with regard to",
    "based on the",
    "can lead to",
}


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def _split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def _words(text: str) -> List[str]:
    return re.findall(r"[A-Za-z0-9']+", text.lower())


def _safe_rate(count: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return count / total


def _sentence_features(sentence: str) -> Dict[str, float]:
    sentence_l = sentence.lower()
    words = _words(sentence_l)
    wc = len(words)
    transitions = sum(1 for t in AI_TRANSITIONS if t in sentence_l)
    hedges = sum(1 for h in AI_HEDGES if re.search(rf"\b{re.escape(h)}\b", sentence_l))
    human_markers = sum(1 for h in HUMAN_MARKERS if re.search(rf"\b{re.escape(h)}\b", sentence_l))
    contractions = sum(1 for c in CONTRACTIONS if c in sentence_l)
    generic_hits = sum(1 for p in GENERIC_AI_PHRASES if p in sentence_l)
    digit_hits = len(re.findall(r"\d", sentence))
    comma_count = sentence.count(",")

    # Positive = more likely AI.
    ai_signal = 0.0
    ai_signal += 0.9 * _safe_rate(transitions, 1)
    ai_signal += 0.6 * _safe_rate(hedges, max(1, wc // 8))
    ai_signal += 0.9 * _safe_rate(generic_hits, 1)
    ai_signal += 0.5 if 12 <= wc <= 28 else -0.2
    ai_signal += 0.2 if comma_count >= 2 else 0.0

    # Human signals reduce AI probability.
    ai_signal -= 0.7 * _safe_rate(human_markers, max(1, wc // 8))
    ai_signal -= 0.7 * _safe_rate(contractions, max(1, wc // 8))
    ai_signal -= 0.2 if digit_hits >= 2 else 0.0

    probability = _clamp(_sigmoid(ai_signal), 0.0, 1.0)
    confidence = abs(probability - 0.5) * 2.0

    return {
        "probability": probability,
        "confidence": confidence,
        "word_count": float(wc),
        "transitions": float(transitions),
        "hedges": float(hedges),
        "human_markers": float(human_markers),
        "contractions": float(contractions),
        "generic_hits": float(generic_hits),
    }


def _global_features(text: str) -> Dict[str, float]:
    words = _words(text)
    sentences = _split_sentences(text)
    if not words or not sentences:
        return {}

    lengths = [len(_words(s)) for s in sentences]
    avg_len = sum(lengths) / max(1, len(lengths))
    variance = sum((l - avg_len) ** 2 for l in lengths) / max(1, len(lengths))
    std_dev = math.sqrt(variance)
    cv = std_dev / max(avg_len, 1e-6)

    counts = Counter(words)
    unique = len(counts)
    hapax = sum(1 for _, c in counts.items() if c == 1)

    transitions = sum(1 for t in AI_TRANSITIONS if t in text.lower())
    hedges = sum(1 for h in AI_HEDGES if re.search(rf"\b{re.escape(h)}\b", text.lower()))
    human_markers = sum(1 for h in HUMAN_MARKERS if re.search(rf"\b{re.escape(h)}\b", text.lower()))
    contractions = sum(1 for c in CONTRACTIONS if c in text.lower())
    generic_hits = sum(1 for p in GENERIC_AI_PHRASES if p in text.lower())

    repetition_ratio = (len(words) - unique) / max(1, len(words))
    transition_density = transitions / max(1, len(sentences))
    hedge_density = hedges / max(1, len(sentences))
    human_density = (human_markers + contractions) / max(1, len(sentences))

    return {
        "word_count": float(len(words)),
        "sentence_count": float(len(sentences)),
        "avg_sent_len": round(avg_len, 2),
        "burstiness": round(std_dev, 2),
        "sentence_cv": round(cv, 3),
        "ttr": round(unique / max(1, len(words)), 3),
        "hapax_ratio": round(hapax / max(1, len(words)), 3),
        "repetition_ratio": round(repetition_ratio, 3),
        "transition_density": round(transition_density, 3),
        "hedge_density": round(hedge_density, 3),
        "human_marker_density": round(human_density, 3),
        "generic_phrase_hits": float(generic_hits),
    }


def _ai_probability(features: Dict[str, float], sentence_probs: List[float]) -> float:
    if not features:
        return 0.0

    burstiness = features["burstiness"]
    ttr = features["ttr"]
    repetition = features["repetition_ratio"]
    transitions = features["transition_density"]
    hedges = features["hedge_density"]
    human_density = features["human_marker_density"]
    cv = features["sentence_cv"]
    generic_hits = features["generic_phrase_hits"]

    # Weighted linear signal calibrated around expected human baseline.
    signal = 0.0
    signal += 1.3 * (0.45 - ttr)
    signal += 1.1 * (0.9 - cv)
    signal += 0.9 * (0.18 - (burstiness / 20.0))
    signal += 1.2 * repetition
    signal += 1.1 * transitions
    signal += 0.8 * hedges
    signal += 0.6 * generic_hits
    signal -= 1.4 * human_density

    if sentence_probs:
        signal += 0.9 * ((sum(sentence_probs) / len(sentence_probs)) - 0.5)

    return _clamp(_sigmoid(signal) * 100.0, 0.0, 100.0)


def _refinement_strength(
    ai_prob: float,
    features: Dict[str, float],
    sentence_probs: List[float],
) -> float:
    if not features or not sentence_probs:
        return 0.0

    switch_count = 0
    last = None
    for p in sentence_probs:
        cls = p >= 0.58
        if last is not None and cls != last:
            switch_count += 1
        last = cls

    switch_rate = switch_count / max(1, len(sentence_probs) - 1)
    human_density = features["human_marker_density"]
    mixed_zone = 1.0 - abs(ai_prob - 50.0) / 50.0

    refine = (0.45 * human_density) + (0.35 * mixed_zone) + (0.20 * switch_rate)
    return _clamp(refine, 0.0, 1.0)


def _label(ai_prob: float, refine_strength: float) -> str:
    if ai_prob >= 72:
        if refine_strength >= 0.42:
            return "AI-generated & AI-refined"
        return "AI-generated"

    if ai_prob >= 42:
        if refine_strength >= 0.45:
            return "Human-written & AI-refined"
        return "AI-generated & AI-refined"

    if refine_strength >= 0.55 and ai_prob >= 25:
        return "Human-written & AI-refined"
    return "Human-written"


def _reasoning(features: Dict[str, float], label: str) -> str:
    if not features:
        return "Insufficient text for reliable stylometric assessment."

    burst = features["burstiness"]
    ttr = features["ttr"]
    transitions = features["transition_density"]
    human = features["human_marker_density"]

    if label == "AI-generated":
        return (
            f"Low stylistic variance (burstiness {burst}) plus transition-heavy flow "
            f"({transitions:.2f}/sentence) aligns with highly uniform AI writing."
        )
    if label == "AI-generated & AI-refined":
        return (
            f"Core structure still leans AI (burstiness {burst}, TTR {ttr}), "
            f"but mixed cues suggest post-editing."
        )
    if label == "Human-written & AI-refined":
        return (
            f"Human markers are present ({human:.2f}/sentence), yet parts of the text "
            "show AI-like smoothing and templated transitions."
        )
    return (
        f"Higher lexical variety (TTR {ttr}) and human-style variance "
        f"(burstiness {burst}) suggest primarily human-authored writing."
    )


def analyze_text(text: str) -> Dict:
    if not text or len(_words(text)) < 12:
        return {
            "score": 0,
            "label": "Insufficient Text",
            "category": "Insufficient Text",
            "reasoning": "Please provide at least 12 words for analysis.",
            "sentences": [],
            "contributors": [],
            "signals": {},
            "confidence": 0.0,
        }

    sentences = _split_sentences(text)
    sentence_rows = []
    sentence_probs = []
    contributors = []

    for sentence in sentences:
        feats = _sentence_features(sentence)
        p = feats["probability"]
        c = feats["confidence"]
        sentence_probs.append(p)
        is_ai = p >= 0.58

        sentence_rows.append(
            {
                "text": sentence,
                "is_ai": is_ai,
                "confidence": round(c, 3),
                "label": "AI-leaning" if is_ai else "Human-leaning",
                "ai_probability": round(p * 100.0, 1),
            }
        )

        if is_ai:
            impact = "High" if c >= 0.65 else "Medium" if c >= 0.4 else "Low"
            contributors.append(
                {
                    "text": sentence,
                    "score": round(p * 100.0, 1),
                    "impact": impact,
                }
            )

    contributors.sort(key=lambda row: row["score"], reverse=True)
    contributors = contributors[:5]

    features = _global_features(text)
    ai_prob = _ai_probability(features, sentence_probs)
    refine_strength = _refinement_strength(ai_prob, features, sentence_probs)
    category = _label(ai_prob, refine_strength)

    confidence = _clamp(abs(ai_prob - 50.0) / 50.0, 0.1, 0.99)

    return {
        "score": int(round(ai_prob)),
        "label": category,
        "category": category,
        "reasoning": _reasoning(features, category),
        "sentences": sentence_rows,
        "contributors": contributors,
        "signals": {
            **features,
            "refinement_strength": round(refine_strength, 3),
        },
        "confidence": round(confidence, 3),
    }
