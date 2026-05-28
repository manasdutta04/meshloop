"""
LLM UTILITY — all agents import call_llm() and call_llm_json() from here.
Uses GitHub Models API (Microsoft) with GPT-4o as primary,
Microsoft Phi-4 as fast/cheap fallback for simple tasks.
"""

import os
import json
import time
import hashlib
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# One client — GitHub Models endpoint, OpenAI-compatible
_client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=os.getenv("GITHUB_TOKEN") or "dummy_key",
)

# Model names on GitHub Models
GPT4O = "gpt-4o"           # high capability — use for discovery + chat
PHI4 = "microsoft/phi-4"   # Microsoft model — use for simple/fast tasks

# Simple file-backed cache to survive restarts and conserve rate limits
CACHE_FILE = Path(".llm_cache.json")
_cache = {}

if CACHE_FILE.exists():
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            _cache = json.load(f)
    except Exception:
        _cache = {}

def _save_cache():
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(_cache, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Warning: Failed to save LLM cache to disk: {e}")

def call_llm(prompt: str, fast: bool = False, temperature: float = 0.2) -> str:
    """
    Call LLM and return text response.
    fast=True uses Microsoft Phi-4 (cheaper, faster, still Microsoft stack).
    fast=False uses GPT-4o (higher quality, use for key tasks).
    Has retry logic for rate limit handling.
    """
    model = PHI4 if fast else GPT4O
    
    # Check cache first
    cache_key = hashlib.md5(f"{model}_{temperature}_{prompt}".encode()).hexdigest()
    if cache_key in _cache:
        print(f"[LLM Cache] Hit for {model}")
        return _cache[cache_key]
        
    for attempt in range(3):
        try:
            response = _client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=1500,
            )
            result = response.choices[0].message.content.strip()
            _cache[cache_key] = result
            _save_cache()
            return result
        except Exception as e:
            error_str = str(e)
            if "rate" in error_str.lower() or "429" in error_str:
                wait = (attempt + 1) * 10  # wait 10s, 20s, 30s
                print(f"Rate limit hit. Waiting {wait}s before retry {attempt+1}/3...")
                time.sleep(wait)
                # If GPT-4o rate limited, fall back to Phi-4
                if not fast:
                    model = PHI4
                    print("Falling back to Phi-4...")
            else:
                # Non-rate-limit error
                if attempt == 2:
                    raise RuntimeError(f"LLM call failed after 3 attempts: {e}")
                time.sleep(2)
    
    raise RuntimeError("LLM call failed: max retries exceeded")


def call_llm_json(prompt: str) -> dict:
    """
    Call LLM and parse response as JSON.
    The prompt MUST end with: Respond ONLY with valid JSON. No markdown. No text before or after.
    """
    full_prompt = prompt + "\n\nRESPOND ONLY WITH VALID JSON. No markdown code blocks. No explanation. No text before or after the JSON object."
    
    raw = call_llm(full_prompt, temperature=0.1)
    
    # Strip any accidental markdown fences
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.rstrip("```").strip()
    
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"LLM returned invalid JSON.\nError: {e}\nRaw (first 500 chars): {raw[:500]}")


def get_embedding(text: str) -> list[float]:
    """
    Get text embedding using text-embedding-3-small via GitHub Models.
    Returns a list of floats (vector).
    """
    # Truncate to 8000 chars to stay within token limits
    text = text[:8000]
    
    # Check cache first
    cache_key = hashlib.md5(f"embedding_{text}".encode()).hexdigest()
    if cache_key in _cache:
        print("[LLM Cache] Hit for text-embedding-3-small")
        return _cache[cache_key]

    response = _client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    result = response.data[0].embedding
    _cache[cache_key] = result
    _save_cache()
    return result


# ── Quick test ────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Testing GPT-4o...")
    try:
        print(call_llm("Say hello in one sentence."))
        print("Testing Phi-4...")
        print(call_llm("Say hello in one sentence.", fast=True))
        print("Testing embedding...")
        vec = get_embedding("test text")
        print(f"Embedding length: {len(vec)}")
        print("All LLM tests passed successfully")
    except Exception as e:
        print("ERROR: Test failed:", str(e))
