import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Fallback for VITE_ prefixed env var
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    api_key = os.environ.get("VITE_OPENAI_API_KEY")

if not api_key:
    # Don't crash on import, but client calls will fail if not set later
    print("WARN: No OPENAI_API_KEY found. LLM calls will fail.")

client = OpenAI(api_key=api_key)

def rewrite_with_llm(model: str, instructions: str, text: str, temperature: float, max_output_tokens: int) -> str:
    target_model = "gpt-4o-mini"
    if "gpt-4" in model:
        target_model = "gpt-4o"

    try:
        resp = client.chat.completions.create(
            model=target_model,
            messages=[
                {"role": "system", "content": instructions},
                {"role": "user", "content": text}
            ],
            temperature=temperature,
            max_tokens=max_output_tokens,
            store=False
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        print(f"LLM Call Error: {e}")
        return text # Return original on fatal error to keep pipeline alive
