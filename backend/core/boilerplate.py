from typing import List

# Expanded list based on QuillBot "AI Phrases" analysis
# These phrases appear exponentially more often in AI text than human text.
DEFAULT_PHRASES = [
    # --- Top Offenders (QuillBot Data) ---
    "delve into", "in summary", "it is important to note", "underscore",
    "testament to", "unwavering", "complex tapestry", "rich history",
    "bustling", "nestled", "realm of", "landscape of", "serves as",
    "not only... but also", "paramount", "multifaceted", "game-changer",
    "unleash", "harness", "elevate", "revolutionize", "dive deep",
    "take a closer look", "conclusion", "all in all", "rapidly evolving",
    "ever-changing", "digital age", "cornerstone", "pivotal",
    "nuanced", "fostering", "spearhead", "groundbreaking",
    
    # --- Structural Signals ---
    "highlights the importance of", "plays a crucial role in", 
    "is essential for", "can lead to", "based on the", "due to the fact that",
    "in order to", "with regard to", "in terms of", "associated with",
    "facilitate", "utilize", "leverage", "optimize", "enhance",
    "comprehensive approach", "holistic", "synergy", "paradigm shift",
    "aligned with", "current best practices", "contemporary",
    
    # --- Academic/Formal Filler ---
    "crucial to", "aimed at minimizing", "emphasizes that",
    "reduce fear of", "decrease feelings of", "clear record of",
    "urgency of intervention", "administer supplemental oxygen",
    "rapidly evolving crisis", "interprofessional collaboration",
    "timely intervention", "communication is crucial", 
    "illustrate the dual", "relevant to this scenario",
    "role in translating", "because it directly involves",
    "interventions are guided by", "contribute to a sense of",
    
    # --- Weak Transitions ---
    "furthermore", "moreover", "additionally", "consequently",
    "thus", "hence", "therefore", "notably", "significantly",
    "interestingly", "importantly", "ultimately",
    
    # --- Conditional/Risk Triggers (Medical) ---
    "if not treated", "if left untreated", "can lead to",
    "raising morbidity", "resulting in", "complications like",
    "complications such as", "associated with", "characterized by",
    "leading to", "causing", "thereby",
    
    # --- Passive/Generic Urgency ---
    "immediate support is needed", "is needed to", "stop things from getting worse",
    "to prevent", "is required to", "is essential to", "measures must be taken",
    
    # --- The "Role Player" (Major AI Giveaway) ---
    "play a key role", "plays a key role", "play a crucial role", "plays a crucial role",
    "play a major role", "plays a major role", "instrumental in", "vital part of",
    "pivotal role", "integral to", "serves as a"
]

def load_phrases(path: str = None) -> List[str]:
    if not path:
        return DEFAULT_PHRASES
        
    try:
        with open(path, "r", encoding="utf-8") as f:
            return [ln.strip() for ln in f if ln.strip() and not ln.strip().startswith("#")]
    except FileNotFoundError:
        return DEFAULT_PHRASES

def find_hits(text: str, phrases: List[str]) -> List[str]:
    t = " " + text.lower() + " "
    hits = []
    for p in phrases:
        p2 = " " + p.lower() + " "
        if p2 in t:
            hits.append(p)
    return hits
