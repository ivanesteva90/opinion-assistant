import os
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Fallback for VITE_ prefixed env var
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    api_key = os.environ.get("VITE_OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

def embed_text(model: str, text: str) -> np.ndarray:
    try:
        resp = client.embeddings.create(model=model, input=text)
        return np.array(resp.data[0].embedding, dtype=np.float32)
    except Exception as e:
        print(f"Embedding error: {e}")
        # Return zero vector fallback to prevent crash
        return np.zeros(1536, dtype=np.float32)

def cosine(a: np.ndarray, b: np.ndarray) -> float:
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) + 1e-12
    return float(np.dot(a, b) / denom)
