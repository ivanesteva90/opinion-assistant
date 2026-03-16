import json

def detect_legal_standard(question_text: str) -> str:
    """
    Analyzes the question text to determine the legal standard and returns
    the specific instruction block to be added to the system prompt.
    """
    question_lower = question_text.lower()
    
    # CUE / Preexistence / Aggravation keywords (English & Spanish)
    cue_keywords = [
        "clear and unmistakable",
        "preexisted",
        "aggravated beyond natural progression",
        "cue",
        "preexistencia",
        "agravación",
        "agravacion"
    ]
    
    if any(keyword in question_lower for keyword in cue_keywords):
        return """
LEGAL STANDARD: CUE / PREEXISTENCE / AGGRAVATION
Your response MUST start with EXACTLY one of these two phrases:
- "There is clear and unmistakable evidence that..."
- "There is not clear and unmistakable evidence that..."

Do NOT use "at least as likely as not" or "50/50" language.
Address BOTH preexistence and aggravation if asked.
"""

    # Direct Service Connection keywords (English & Spanish)
    # Defaulting to this if no CUE keywords found, but checking for explicit keywords helps confirm
    direct_keywords = [
        "incurred in",
        "caused by service",
        "due to in-service",
        "direct service connection",
        "nexus",
        "incurrido en",
        "causado por servicio",
        "resultado de dolor en servicio",
        "conexión directa",
        "conexion directa"
    ]
    
    # We default to Direct Service Connection if it's not CUE.
    return """
LEGAL STANDARD: DIRECT SERVICE CONNECTION
Your response MUST start with EXACTLY one of these two phrases:
- "It is at least as likely as not (>=50% probability) that..."
- "It is less likely than not (<50% probability) that..."

Do NOT use "clear and unmistakable" language.
"""

def build_system_prompt(base_prompt: str, legal_instruction: str) -> str:
    # Append the strict legal instruction to the end of the base prompt
    return f"{base_prompt}\n\n{legal_instruction}"
