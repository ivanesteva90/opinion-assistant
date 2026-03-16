import os
import json
import re
import math
from collections import Counter
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    api_key = os.environ.get("VITE_OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

# --- Estadísticas Estilométricas (Hard Data) ---

def calculate_stylometry(text):
    """
    Calcula métricas científicas para detectar patrones de IA basados en la distribución de tokens.
    Referencias: 
    - "Building an AI detector from scratch Part I": Burstiness & Perplexity.
    - "Part II": AI mimics styles (personas) but retains structural smoothness vs Human "Chaos".
    """
    words = re.findall(r'\b\w+\b', text.lower())
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.split()) > 3]
    
    if not words or not sentences:
        return None

    # 1. Burstiness (Sentence Length Variation)
    lengths = [len(s.split()) for s in sentences]
    avg_len = sum(lengths) / len(lengths)
    variance = sum((l - avg_len) ** 2 for l in lengths) / len(lengths)
    std_dev = math.sqrt(variance)

    # 2. Type-Token Ratio (TTR) - Vocabulary Richness
    unique_words = set(words)
    ttr = len(unique_words) / len(words)

    # 3. Hapax Legomena Ratio - Unique Words occurring exactly once
    word_counts = Counter(words)
    hapax_count = sum(1 for count in word_counts.values() if count == 1)
    hapax_ratio = hapax_count / len(words)

    return {
        "word_count": len(words),
        "sentence_count": len(sentences),
        "avg_sent_len": round(avg_len, 2),
        "burstiness": round(std_dev, 2),
        "ttr": round(ttr, 2),
        "hapax_ratio": round(hapax_ratio, 2)
    }

SYSTEM_PROMPT = """You are a Forensic Stylometry Analyst. You detect AI-generated text by analyzing statistical patterns and structural "DNA".

**INSIGHTS FROM RESEARCH (Part II):**
1.  **The "Persona" Trap:** AI models (GPT-4, Claude) are often prompted to "act like a casual human" or "write like a doctor". They simulate style (slang, jargon) but FAIL to simulate structural *chaos*.
2.  **Temperature Artifacts:** High-temperature AI text (trying to be creative) often becomes incoherent or hallucinates metaphors, whereas human creativity is grounded.
3.  **Simulated vs. Real Imperfection:** 
    - **AI:** Makes "safe" typos or uses generic slang ("gonna", "wanna") while maintaining perfect sentence structure.
    - **Human:** Has *structural* messiness (trailing thoughts, abrupt topic shifts, uneven pacing).

**INPUT DATA:**
- **Stats:**
    - `burstiness`: Standard Deviation of sentence length.
        - **< 6.0**: ROBOTIC SMOOTHNESS (Strong AI Indicator).
        - **> 12.0**: HUMAN CHAOS (Strong Human Indicator).
    - `ttr`: Vocabulary richness.
        - **< 0.40**: Repetitive/Safe (AI).
        - **> 0.60**: Rich/Idiosyncratic (Human).

**DECISION MATRIX:**

1.  **MEDICAL/PROFESSIONAL CONTEXT (The PointWise Use Case):**
    - **Real Human Doctor:** Writes in dense, sometimes clunky shorthand. Uses specific dates, measurements, and "dry" facts without needing to "connect" them with smooth transitions.
    - **AI Doctor:** Writes a "perfect essay". Uses smooth transitions ("Furthermore", "It is evident that") to connect facts. It "hedges" excessively ("It seems", "It is likely").
    - **VERDICT:** If text is "Smooth Professional" -> **AI**. If text is "Dry/Clunky Professional" -> **HUMAN**.

2.  **CASUAL CONTEXT:**
    - **Real Human:** Chaotic, specific personal anecdotes, weird punctuation usage.
    - **AI Persona:** "Hello fellow kids" vibe. Generic slang, perfect grammar underneath.

**OUTPUT (JSON):**
{
  "score": <0-100 integer, AI Probability>,
  "label": <"Human-written" | "AI-generated">,
  "reasoning": <Short explanation, e.g. "Text is too smooth (Burstiness 4.2). Uses 'AI transitions' despite medical jargon.">,
  "sentences": [ ... ],
  "contributors": [ ... ]
}
"""

def analyze_text(text):
    if not text or len(text.split()) < 5:
        return {"score": 0, "label": "Insufficient Text", "sentences": [], "contributors": []}

    stats = calculate_stylometry(text)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"STYLOMETRIC STATS: {json.dumps(stats)}\n\nTEXT TO ANALYZE:\n{text}"}
            ],
            response_format={"type": "json_object"},
            temperature=0.0
        )
        
        result = json.loads(response.choices[0].message.content)
        
        if "score" not in result:
            result["score"] = 50
            result["label"] = "Uncertain"
            
        return result
        
    except Exception as e:
        print(f"Error: {e}")
        return {"score": 0, "label": "Error", "sentences": [], "contributors": []}
