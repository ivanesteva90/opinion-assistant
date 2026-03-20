import os
from typing import List, Sequence, Union
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

try:
    import numpy as np
except Exception:  # pragma: no cover - optional dependency fallback
    np = None

# Fallback for VITE_ prefixed env var
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    api_key = os.environ.get("VITE_OPENAI_API_KEY")

client = OpenAI(api_key=api_key) if api_key else None

Vector = Union[List[float], "np.ndarray"]


def _zero_vector(dim: int = 1536) -> Vector:
    if np is not None:
        return np.zeros(dim, dtype=np.float32)
    return [0.0] * dim


def embed_text(model: str, text: str) -> Vector:
    if client is None:
        return _zero_vector()

    try:
        resp = client.embeddings.create(model=model, input=text)
        embedding = resp.data[0].embedding
        if np is not None:
            return np.array(embedding, dtype=np.float32)
        return list(embedding)
    except Exception as e:
        print(f"Embedding error: {e}")
        return _zero_vector()


def _as_sequence(v: Vector) -> Sequence[float]:
    if np is not None and hasattr(v, "tolist"):
        return v.tolist()
    return v  # type: ignore[return-value]


def cosine(a: Vector, b: Vector) -> float:
    if np is not None:
        denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-12
        return float(np.dot(a, b) / denom)

    seq_a = _as_sequence(a)
    seq_b = _as_sequence(b)
    if not seq_a or not seq_b or len(seq_a) != len(seq_b):
        return 0.0

    dot = sum(x * y for x, y in zip(seq_a, seq_b))
    norm_a = sum(x * x for x in seq_a) ** 0.5
    norm_b = sum(y * y for y in seq_b) ** 0.5
    denom = (norm_a * norm_b) + 1e-12
    return float(dot / denom)
