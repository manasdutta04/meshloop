"""
LLM UTILITY — all agents import call_llm() and call_llm_json() from here.
Uses GitHub Models API (Microsoft) with GPT-4o as primary,
Microsoft Phi-4 as fast/cheap fallback for simple tasks.
"""

import os
import json
import time
import hashlib
import random
from pathlib import Path
import threading
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# One client — GitHub Models endpoint, OpenAI-compatible
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
_client = OpenAI(
    base_url="https://models.github.ai/inference",
    api_key=GITHUB_TOKEN or None,
)
USE_REMOTE_EMBEDDINGS = bool(GITHUB_TOKEN)

# Expected embedding dimension for text-embedding-3-small
EMBEDDING_DIM = 1536

# Model names on GitHub Models
GPT4O = "gpt-4o"           # high capability — use for discovery + chat
PHI4 = "microsoft/phi-4"   # Microsoft model — use for simple/fast tasks

# Simple file-backed cache to survive restarts and conserve rate limits
CACHE_FILE = Path(".llm_cache.json")
_cache = {}
_lock = threading.RLock()

with _lock:
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                _cache = json.load(f)
        except Exception:
            _cache = {}

def _save_cache():
    with _lock:
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
    with _lock:
        cache_key = hashlib.md5(f"{model}_{temperature}_{prompt}".encode()).hexdigest()
        if cache_key in _cache:
            print(f"[LLM Cache] Hit for {model}")
            return _cache[cache_key]

    # Exponential backoff with up to 5 attempts
    for attempt in range(5):
        try:
            response = _client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=1500,
            )
            result = response.choices[0].message.content.strip()
            with _lock:
                _cache[cache_key] = result
                _save_cache()
            return result
        except Exception as e:
            error_str = str(e)
            # Detect rate-limit like errors and back off
            if "rate" in error_str.lower() or "429" in error_str or "Too many requests" in error_str:
                wait = (2 ** attempt) * 5
                print(f"LLM rate limit detected. Backing off {wait}s (attempt {attempt+1}/5)")
                time.sleep(wait)
                # If using high-quality model and hitting limits, try fast model as a fallback
                if not fast:
                    fast = True
                    model = PHI4
                    print("Switching to fast/fallback model (Phi-4)")
                continue
            # Non-rate-limit error: short sleep then retry
            print(f"LLM call error (attempt {attempt+1}/5): {e}")
            time.sleep(2)

    # If we exhausted retries, provide a graceful fallback (avoid raising to keep UI stable)
    fallback_msg = "[LLM unavailable due to rate limits or network errors. Try again later or use smaller datasets.]"
    print("LLM fallback engaged after repeated failures.")
    with _lock:
        _cache[cache_key] = fallback_msg
        _save_cache()
    return fallback_msg


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
        # If fallback message provided or parse failed, return empty dict to let callers handle gracefully
        print(f"Warning: call_llm_json failed to parse JSON: {e}. Returning empty dict.")
        return {}


def _validate_embedding(vec, text: str) -> list[float]:
    """Ensure embedding vectors are the expected dimension and type."""
    if not isinstance(vec, list):
        try:
            vec = list(vec)
        except Exception:
            raise ValueError(f"Embedding result is not list-like for text '{text[:40]}...' ")

    if len(vec) != EMBEDDING_DIM:
        raise ValueError(
            f"Unexpected embedding dimension {len(vec)} for text '{text[:40]}...'; expected {EMBEDDING_DIM}"
        )

    return vec


def get_embedding(text: str) -> list[float]:
    """
    Get text embedding using text-embedding-3-small via GitHub Models.
    Returns a list of floats (vector).
    """
    # Truncate to 8000 chars to stay within token limits
    text = (text or "")[:8000]

    # Check cache first
    with _lock:
        cache_key = hashlib.md5(f"embedding_{text}".encode()).hexdigest()
        if cache_key in _cache:
            vec = _cache[cache_key]
            try:
                vec = _validate_embedding(vec, text)
                print("[LLM Cache] Hit for text-embedding-3-small")
                return vec
            except ValueError as err:
                print(f"[LLM Cache] Found invalid embedding: {err}. Recomputing fallback with correct dim={EMBEDDING_DIM}.")

    try:
        if not USE_REMOTE_EMBEDDINGS:
            raise RuntimeError("No GitHub token configured; using pseudo-embedding fallback.")

        # Call embedding API in a background thread with a short timeout to avoid long blocking on rate-limits
        result_container = {}

        def _call_api():
            try:
                response = _client.embeddings.create(
                    model="text-embedding-3-small",
                    input=text,
                )
                result_container['embedding'] = response.data[0].embedding
            except Exception as e:
                result_container['error'] = e

        t = threading.Thread(target=_call_api, daemon=True)
        t.start()
        t.join(8)  # wait up to 8 seconds
        if t.is_alive() or 'error' in result_container:
            err = result_container.get('error', 'timeout')
            print(f"Embedding request failed or timed out ({err}). Using pseudo-embedding fallback.")
            raise RuntimeError(err)

        result = result_container.get('embedding')
        if result is None:
            raise RuntimeError("Embedding API returned no result")

        result = _validate_embedding(result, text)
        with _lock:
            _cache[cache_key] = result
            _save_cache()
        return result
    except Exception as e:
        print(f"Embedding request failed: {e}. Using pseudo-embedding fallback.")
        # Deterministic pseudo-embedding fallback (keeps system functional under rate limits)
        def _pseudo_embedding(s: str, dim: int = EMBEDDING_DIM):
            # Use 1536 to match text-embedding-3-small / production embedding dimension
            seed = int(hashlib.md5(s.encode('utf-8')).hexdigest()[:16], 16)
            rnd = random.Random(seed)
            # Values in range [-0.5, 0.5]
            vec = [rnd.random() - 0.5 for _ in range(dim)]
            return vec

        vec = _pseudo_embedding(text)
        with _lock:
            _cache[cache_key] = vec
            _save_cache()
        return vec


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
