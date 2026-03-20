def base_rules(min_chars: int, max_chars: int, keep_sentence: bool, keep_paragraphs: bool) -> str:
    rules = [
        "Rewrite the text so it sounds naturally human while preserving the original meaning.",
        "",
        "NON-NEGOTIABLE RULES:",
        "- Do NOT add new facts, claims, references, examples, or recommendations.",
        "- Do NOT remove medically relevant details.",
        "- Keep placeholders like [[P0]] exactly unchanged.",
        f"- Keep total length between {min_chars} and {max_chars} characters.",
        "- Output ONLY the rewritten text.",
        "",
        "STYLE RULES:",
        "- Prefer clear, direct sentences over textbook phrasing.",
        "- Use varied sentence rhythm, but stay coherent and professional.",
        "- Avoid filler transitions (e.g., 'Furthermore', 'In conclusion').",
        "- Avoid repetitive sentence templates.",
        "- Keep tone natural, not dramatic.",
    ]

    if keep_sentence:
        rules.append("- Keep the same number of sentences unless a tiny adjustment is needed for readability.")
    if keep_paragraphs:
        rules.append("- Keep the same number of paragraphs.")

    return "\n".join(rules)


def strategy_prompt(strategy: str) -> str:
    if strategy == "minimal":
        return (
            "STRATEGY: Minimal polish. Keep structure close to original, "
            "remove stiffness, and improve flow."
        )
    if strategy == "direct":
        return (
            "STRATEGY: Direct clinical language. Shorter, clearer sentences; "
            "reduce abstract wording."
        )
    if strategy == "academic_human":
        return (
            "STRATEGY: Professional but human. Keep technical precision while "
            "sounding like an experienced clinician writing naturally."
        )
    if strategy == "simplify":
        return (
            "STRATEGY: Simplify complexity. Split overloaded sentences and remove "
            "unnecessary subordinate clauses."
        )
    if strategy == "bursty":
        return (
            "STRATEGY: Moderate variation. Increase sentence-length variety without "
            "using fragments that hurt clarity."
        )

    return "STRATEGY: Balanced rewrite with strong fidelity and natural flow."


def build_instructions(
    strategy: str,
    min_chars: int,
    max_chars: int,
    keep_sentence: bool,
    keep_paragraphs: bool,
) -> str:
    rules = base_rules(min_chars, max_chars, keep_sentence, keep_paragraphs)
    rules += "\n\n" + strategy_prompt(strategy)

    rules += "\n\nQUALITY CHECK BEFORE FINALIZING:"
    rules += "\n1. Verify all key facts remain present."
    rules += "\n2. Verify no new absolute claims were introduced."
    rules += "\n3. Verify readability improved without changing intent."

    return rules
