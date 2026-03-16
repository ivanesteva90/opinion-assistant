def base_rules(min_chars: int, max_chars: int, keep_sentence: bool, keep_paragraphs: bool) -> str:
    rules = [
        "Rewrite the text to sound natural and human while preserving meaning and facts.",
        "HARD RULES:",
        "- Do NOT add new examples, stories, opinions, or new information.",
        "- Do NOT change any numbers, acronyms, or placeholders like [[P0]] (they must remain exactly).",
        f"- Keep length between {min_chars} and {max_chars} characters.",
        "- Output ONLY the rewritten text.",
        "",
        "ANTI-DETECTION RULES (INVERSE STRATEGY):",
        "1. Avoid 'Generic Language': Do not use common AI transitions like 'Furthermore', 'In conclusion', 'It is important to note'.",
        "2. High Burstiness: Vary sentence length drastically. Don't write a string of 20-word sentences. Mix 5-word sentences with 30-word ones.",
        "3. High Perplexity: Use less predictable vocabulary. Instead of 'utilize', use 'use'. Instead of 'facilitate', use 'help'. Avoid the most probable next word.",
        "4. Imperfection: Humans are not perfect. You can start sentences with 'And', 'But', or 'So'. You can use contractions like 'can't' or 'won't'.",
        "5. NO TEXTBOOK DEFINITIONS: Do not start paragraphs with a direct definition like 'X is a Y that...'. Instead, weave the definition into the context or action.",
        "   - Bad: 'Community-acquired pneumonia (CAP) leads to many hospital visits.'",
        "   - Good: 'When kids get sick with community-acquired pneumonia (CAP), it often lands them in the hospital.'",
        "   - Bad: 'Early diagnosis improves outcomes.'",
        "   - Good: 'Catching it early with a chest X-ray can make a huge difference in recovery.'"
    ]
    if keep_sentence:
        rules.append("- Keep the same number of sentences as the original.")
    if keep_paragraphs:
        rules.append("- Keep the same number of paragraphs as the original.")
    return "\n".join(rules)

def strategy_prompt(strategy: str) -> str:
    if strategy == "minimal":
        return "STRATEGY: Make minimal edits. Fix flow and remove stiffness, but keep the professional tone. Do not over-simplify."
    if strategy == "direct":
        return "STRATEGY: Use direct, clear wording. Prefer concrete verbs over abstract nouns. Remove academic filler words (e.g., 'in order to', 'utilize')."
    if strategy == "academic_human":
        return "STRATEGY: Academic but conversational. Write like a professor explaining to a student in office hours, not like a textbook. Use short sentences to explain complex ideas. Break up dense information."
    if strategy == "simplify":
        return "STRATEGY: Aggressive Simplification. Break long sentences into two. Remove sub-clauses. If a sentence has 'and' connecting two big ideas, split it with a period."
    if strategy == "bursty":
        return "STRATEGY: NUCLEAR BURSTINESS. Your goal is to shatter the sentence rhythm. Use fragments. 'Like this.' Don't just list symptoms; describe them. Mix 3-word sentences with 15-word ones. Never write 3 long sentences in a row."
    
    return "STRATEGY: Balanced rewrite. Natural, clear, and undetectable."

def build_instructions(strategy: str, min_chars: int, max_chars: int, keep_sentence: bool, keep_paragraphs: bool) -> str:
    rules = base_rules(min_chars, max_chars, keep_sentence, keep_paragraphs) + "\n\n" + strategy_prompt(strategy)
    
    # Global "Nuclear" Rules to fix the 81% AI score
    rules += "\n\nGLOBAL OVERRIDE RULES:"
    rules += "\n1. NO INFORMATION STACKING: Do not cram Cause + Mechanism + Effect into one sentence. Split them."
    rules += "\n   - Bad: 'Inflammation causes fluid buildup which leads to low oxygen.'"
    rules += "\n   - Good: 'Inflammation causes fluid buildup. This messes with gas exchange. The result? Low oxygen.'"
    rules += "\n2. USE FRAGMENTS: Occasionally use incomplete sentences for emphasis. It makes the text feel human."
    rules += "\n3. JARGON DILUTION: Do not list more than 2 technical medical terms in one sentence. Spread them out."
    rules += "\n   - Bad: 'Complications include pleural effusion, empyema, and sepsis.'"
    rules += "\n   - Good: 'Complications include pleural effusion or empyema. In severe cases, sepsis can set in.'"
    rules += "\n   - Bad: 'Alveoli fluid buildup impairs gas exchange.'"
    rules += "\n   - Good: 'Fluid builds up in the alveoli. This blocks gas exchange.'"
    rules += "\n4. PATIENT NARRATIVE: Do not use the 'If X, then complications A, B, C' structure. Describe it as a story of the patient."
    rules += "\n   - Bad: 'If not treated, complications like empyema occur, raising morbidity.'"
    rules += "\n   - Good: 'Without quick treatment, the child could develop empyema. This means a longer hospital stay and a slower recovery.'"
    rules += "\n5. ACTIVE URGENCY: Never use passive voice for recommendations. Humans say 'Do this', not 'This must be done'."
    rules += "\n   - Bad: 'Immediate support is needed to stop things from getting worse.'"
    rules += "\n   - Good: 'You have to act fast before it spirals.'"
    rules += "\n   - Bad: 'Careful monitoring is required.'"
    rules += "\n   - Good: 'Doctors need to watch them like a hawk.'"
    rules += "\n6. NO LAZY POINTERS: Do not start sentences with 'This is' or 'These are' to refer to the previous sentence. Be specific or use action verbs."
    rules += "\n   - Bad: 'These are early warning signs.'"
    rules += "\n   - Good: 'Treat these as early warning signs.' or 'Don't ignore these red flags.'"
    rules += "\n7. VERB-DRIVEN SYMPTOMS: Avoid static noun phrases for symptoms. Use verbs to describe the change."
    rules += "\n   - Bad: 'The result? Low oxygen levels and harder breathing.'"
    rules += "\n   - Good: 'The result? Oxygen levels tank and breathing becomes a struggle.'"
    rules += "\n8. NO PARALLEL SYMMETRY: Avoid perfectly balanced compound sentences ('X is Y, and A is B'). Use subordination."
    rules += "\n   - Bad: 'Their airways are smaller, and their immune systems aren't fully developed.'"
    rules += "\n   - Good: 'Since their airways are so small and their immune systems are still learning the ropes, they are at higher risk.'"
    rules += "\n9. CASUAL IMPERATIVES: Do not use formal commands like 'demand immediate action' or 'requires attention'. Be direct."
    rules += "\n   - Bad: 'These red flags demand immediate action.'"
    rules += "\n   - Good: 'If you see these red flags, don't wait.'"
    rules += "\n10. NO MELODRAMA: Avoid dramatic verbs or 'storyteller' intros. Be dry and factual."
    rules += "\n    - Bad: 'When pneumonia strikes...'"
    rules += "\n    - Good: 'In cases of pneumonia...'"
    rules += "\n    - Bad: 'Oxygen levels tank.'"
    rules += "\n    - Good: 'Oxygen levels drop.'"
    rules += "\n    - Bad: 'Breathing becomes a struggle.'"
    rules += "\n    - Good: 'Breathing gets harder.'"
    rules += "\n11. NO ROLE-PLAYING: Never say 'X plays a key role in Y'. Just say 'X does Y'."
    rules += "\n    - Bad: 'Nurses play a key role in spotting signs.'"
    rules += "\n    - Good: 'Nurses are usually the first to spot the signs.'"
    rules += "\n12. BREAK PERFECT LISTS: Do not use the 'A, B, and C' sentence structure. It's too rhythmic."
    rules += "\n    - Bad: 'They spot distress, clear airways, and teach families.'"
    rules += "\n    - Good: 'They spot distress and clear the airways. Then, they teach families what to do.'"
    rules += "\n13. NO CONSEQUENCE TAILS: Never use ', leading to X' or ', resulting in Y'. End the sentence and start a new one."
    rules += "\n    - Bad: 'Sepsis can set in, leading to longer hospital stays.'"
    rules += "\n    - Good: 'Sepsis can set in. This means the child stays in the hospital longer.'"
    rules += "\n    - Bad: 'This causes hypoxia.'"
    rules += "\n    - Good: 'This drops oxygen levels.'"
    return rules

