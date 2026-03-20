from core.models import HumanizeReq, HumanizeRes
from core.protect import protect, unprotect
from core.prompts import build_instructions
from core.llm_client import rewrite_with_llm
from core.embed import embed_text, cosine
from core.boilerplate import load_phrases, find_hits
from core.ranker import score_candidate

def _max_output_tokens(max_chars: int) -> int:
    est = int((max_chars / 4) * 1.25)
    return max(120, min(2000, est))

def run_humanize(req: HumanizeReq) -> HumanizeRes:
    inp = req.text.strip()
    in_chars = len(inp)
    
    # Calculate constraints
    min_chars = int(in_chars * (1 - req.length_ratio))
    max_chars = int(in_chars * (1 + req.length_ratio))
    
    # 1. Protect Data
    masked, mapping = protect(inp)
    
    # Load boilerplate phrases
    phrases = load_phrases() # Default list
    
    # 2. Get Input Embedding for Fidelity Check
    e_in = embed_text("text-embedding-3-small", masked)
    
    # 3. Define Strategies based on Mode
    strategies = ["balanced", "direct", "minimal"]
    if req.mode == "precise":
        strategies = ["minimal", "direct", "academic_human"]
    elif req.mode == "creative":
        strategies = ["balanced", "bursty", "direct"]
    elif req.mode == "ghost":
        strategies = ["academic_human", "direct", "bursty"]

    temp_map = {"precise": 0.2, "balanced": 0.35, "creative": 0.55, "ghost": 0.45}
    temperature = temp_map.get(req.mode, 0.45)

    model = req.model or "gpt-4o-mini"
    max_out_tok = _max_output_tokens(max_chars)
    
    # 4. Generate Candidates
    candidates = []
    print(f"Generating {len(strategies)} candidates for mode {req.mode}...")
    
    for strat in strategies:
        instr = build_instructions(strat, min_chars, max_chars, req.keep_sentence_count, req.keep_paragraph_count)
        
        # Call LLM
        out = rewrite_with_llm(model, instr, masked, temperature, max_out_tok)
        
        if not out or not out.strip():
            out = masked

        # Analyze Candidate
        hits = find_hits(out, phrases)
        e_out = embed_text("text-embedding-3-small", out)
        sim = cosine(e_in, e_out)
        
        # Score Candidate
        score, violations = score_candidate(masked, out, sim, hits, mapping, 
                                            min_chars, max_chars, 
                                            req.keep_sentence_count, req.keep_paragraph_count)
        
        candidates.append({
            "strategy": strat,
            "text": out,
            "sim": sim,
            "boilerplate_hits": hits,
            "violations": violations,
            "score": score
        })
        print(f"Candidate ({strat}): score={score:.2f}, sim={sim:.2f}, violations={len(violations)}")

    if not candidates:
        return HumanizeRes(
            output=inp,
            fidelity_ok=False,
            retries=0,
            input_chars=in_chars,
            output_chars=in_chars,
            violations=["no_candidates"],
            boilerplate_hits=[],
        )

    # 5. Select Best Candidate
    candidates.sort(key=lambda x: x["score"], reverse=True)
    best = candidates[0]
    
    # 6. Optional Retry (Polish)
    retries = 0
    while retries < req.max_retries and (best["violations"] or len(best["boilerplate_hits"]) >= 1):
        retries += 1
        print("Best candidate has issues, attempting fix...")
        fix_instr = build_instructions("direct", min_chars, max_chars, req.keep_sentence_count, req.keep_paragraph_count)
        fix_instr += "\nFIX INSTRUCTIONS:\n"
        if best["boilerplate_hits"]:
            fix_instr += "Avoid these phrases exactly: " + "; ".join(best["boilerplate_hits"]) + ".\n"
        if best["violations"]:
            fix_instr += "Fix these issues: " + ", ".join(best["violations"]) + ".\n"

        out2 = rewrite_with_llm(model, fix_instr, masked, max(0.15, temperature - 0.15), max_out_tok)
        if not out2 or not out2.strip():
            break

        # Re-score fix
        hits2 = find_hits(out2, phrases)
        e_out2 = embed_text("text-embedding-3-small", out2)
        sim2 = cosine(e_in, e_out2)
        score2, violations2 = score_candidate(masked, out2, sim2, hits2, mapping,
                                              min_chars, max_chars,
                                              req.keep_sentence_count, req.keep_paragraph_count)

        if score2 > best["score"]:
            print(f"Fix successful! Score improved {best['score']:.2f} -> {score2:.2f}")
            best = {
                "strategy": "retry_fix",
                "text": out2,
                "sim": sim2,
                "boilerplate_hits": hits2,
                "violations": violations2,
                "score": score2
            }
        else:
            print("Fix failed to improve score, keeping original.")
            break

    # 7. Unprotect (Finalize)
    final_output = unprotect(best["text"], mapping)
    
    return HumanizeRes(
        output=final_output,
        fidelity_ok=len(best["violations"]) == 0,
        retries=retries,
        input_chars=in_chars,
        output_chars=len(final_output),
        violations=best["violations"],
        boilerplate_hits=best["boilerplate_hits"]
    )
