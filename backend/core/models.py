from pydantic import BaseModel, Field
from typing import List, Optional

class HumanizeReq(BaseModel):
    text: str = Field(..., min_length=1)
    mode: str = "balanced"  # precise | balanced | creative | ghost
    model: str = "gpt-5.1" # Legacy field for compatibility
    length_ratio: float = 0.15
    keep_sentence_count: bool = True
    keep_paragraph_count: bool = True
    max_retries: int = 1

class HumanizeRes(BaseModel):
    output: str
    fidelity_ok: bool
    retries: int
    input_chars: int
    output_chars: int
    violations: List[str] = []
    boilerplate_hits: List[str] = []