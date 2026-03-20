from pydantic import BaseModel, Field
from typing import List, Literal

class HumanizeReq(BaseModel):
    text: str = Field(..., min_length=1)
    mode: Literal["precise", "balanced", "creative", "ghost"] = "balanced"
    model: str = "gpt-5.1" # Legacy field for compatibility
    length_ratio: float = Field(0.15, ge=0.05, le=0.35)
    keep_sentence_count: bool = True
    keep_paragraph_count: bool = True
    max_retries: int = Field(1, ge=0, le=3)

class HumanizeRes(BaseModel):
    output: str
    fidelity_ok: bool
    retries: int
    input_chars: int
    output_chars: int
    violations: List[str] = []
    boilerplate_hits: List[str] = []
