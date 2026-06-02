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
from contextlib import contextmanager
from contextvars import ContextVar
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / ".env", override=False)

# One client — GitHub Models endpoint, OpenAI-compatible
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
USE_REMOTE_EMBEDDINGS = bool(GITHUB_TOKEN) and os.getenv("USE_REMOTE_EMBEDDINGS", "true").lower() != "false"
CACHE_TEXT_RESPONSES = os.getenv("CACHE_TEXT_RESPONSES", "false").lower() == "true"

# Expected embedding dimension for text-embedding-3-small
EMBEDDING_DIM = 1536

# Model names on GitHub Models
GPT4O = "gpt-4o"           # high capability — use for discovery + chat
PHI4 = "microsoft/phi-4"   # Microsoft model — use for simple/fast tasks

# Simple file-backed cache to survive restarts and conserve rate limits
CACHE_FILE = Path(".llm_cache.json")
CACHE_VERSION = "v2"
_cache = {}
_lock = threading.RLock()
_demo_mode = ContextVar("meshloop_demo_mode", default=False)
_warned_embedding_fallback = False
_warned_prod_rate_limit_fallback = False
_runtime_ai_config = ContextVar("meshloop_runtime_ai_config", default={})
_client_cache: dict[tuple[str, str | None], OpenAI] = {}


@contextmanager
def demo_mode(enabled: bool):
    token = _demo_mode.set(enabled)
    try:
        yield
    finally:
        _demo_mode.reset(token)


def _is_demo_mode() -> bool:
    return bool(_demo_mode.get())


@contextmanager
def runtime_ai_config(config: dict):
    token = _runtime_ai_config.set(config or {})
    try:
        yield
    finally:
        _runtime_ai_config.reset(token)


def _current_ai_config() -> dict:
    return _runtime_ai_config.get() or {}


def _build_client() -> OpenAI:
    cfg = _current_ai_config()
    base_url = cfg.get("base_url") or "https://models.github.ai/inference"
    api_key = cfg.get("api_key") or GITHUB_TOKEN or None
    key = (base_url, api_key)
    with _lock:
        client = _client_cache.get(key)
        if client is None:
            client = OpenAI(base_url=base_url, api_key=api_key)
            _client_cache[key] = client
        return client


def _chat_model(fast: bool = False) -> str:
    cfg = _current_ai_config()
    if cfg.get("chat_model"):
        return cfg["chat_model"]
    return PHI4 if fast else GPT4O


def _embedding_model() -> str:
    cfg = _current_ai_config()
    return cfg.get("embedding_model") or "text-embedding-3-small"


# Providers whose base URLs are known to NOT support embeddings
_NO_EMBEDDING_BASE_URLS = (
    "api.groq.com",
)


def _provider_has_embeddings() -> bool:
    """Returns False for providers (e.g. Groq) that don't expose an embeddings endpoint."""
    base_url = (_current_ai_config().get("base_url") or "").lower()
    return not any(domain in base_url for domain in _NO_EMBEDDING_BASE_URLS)


def _is_rate_limit_error(err: Exception | str) -> bool:
    msg = str(err).lower()
    return "429" in msg or "too many requests" in msg or "rate limit" in msg or "rate-limited" in msg

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
    model = _chat_model(fast=fast)
    demo = _is_demo_mode()
    cache_key = hashlib.md5(f"{CACHE_VERSION}_{'demo' if demo else 'prod'}_{model}_{temperature}_{prompt}".encode()).hexdigest()

    # Check cache first
    if demo and CACHE_TEXT_RESPONSES:
        with _lock:
            if cache_key in _cache:
                print(f"[LLM Cache] Hit for {model}")
                return _cache[cache_key]

    if not GITHUB_TOKEN:
        if demo:
            result = _local_text_response(prompt, fast=fast)
            if CACHE_TEXT_RESPONSES:
                with _lock:
                    _cache[cache_key] = result
                    _save_cache()
            return result
        raise RuntimeError("Remote LLM not configured. Normal uploads require AI-generated output.")

    # Retry with bounded timeout so discovery cannot hang indefinitely
    for attempt in range(3):
        try:
            response = _build_client().chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=1500,
                timeout=45,
            )
            result = response.choices[0].message.content.strip()
            if demo and CACHE_TEXT_RESPONSES:
                with _lock:
                    _cache[cache_key] = result
                    _save_cache()
            return result
        except Exception as e:
            error_str = str(e)
            # Detect rate-limit like errors and back off
            if "rate" in error_str.lower() or "429" in error_str or "Too many requests" in error_str:
                wait = (2 ** attempt) * 2
                print(f"LLM rate limit detected. Backing off {wait}s (attempt {attempt+1}/3)")
                time.sleep(wait)
                # If using high-quality model and hitting limits, try fast model as a fallback
                if not fast and not _current_ai_config().get("chat_model"):
                    fast = True
                    model = PHI4
                    print("Switching to fast/fallback model (Phi-4)")
                continue
            # Non-rate-limit error: short sleep then retry
            print(f"LLM call error (attempt {attempt+1}/3): {e}")
            if attempt < 2:
                time.sleep(1.5)

    # If we exhausted retries, provide a graceful fallback (avoid raising to keep UI stable)
    if demo:
        fallback_msg = "[LLM unavailable due to rate limits or network errors. Try again later or use smaller datasets.]"
        print("LLM fallback engaged after repeated failures.")
        return _local_text_response(prompt, fast=fast, fallback=fallback_msg)

    raise RuntimeError("LLM request failed after retries. Normal uploads require AI-generated output.")


def _local_text_response(prompt: str, fast: bool = False, fallback: str = "") -> str:
    """Deterministic local response when remote LLMs are unavailable."""
    lower = prompt.lower()

    if "suggest exactly 3 short follow-up questions" in lower:
        return json.dumps([
            "What is the strongest evidence in the retrieved data?",
            "Which file or column shows the biggest anomaly?",
            "What should be validated next in the source data?",
        ])

    if "respond only with valid json" in lower:
        if "insights" in lower:
            return json.dumps({"insights": []})
        return json.dumps({})

    if "executive summary" in lower or "business audience" in lower:
        return "The dataset contains clear signals worth reviewing, with the strongest findings appearing in the retrieved metrics and related source logs. Start with the top anomaly, then verify the linked files before acting."

    if "you are meshloop" in lower or "forensic data analyst" in lower:
        return (
            "I could not reach the remote model, but the retrieved context still points to the most relevant source files and anomalies. "
            "Review the highlighted chunks, compare the metric drop to the associated log events, and validate the exact file names cited in the context. "
            "💡 Action: inspect the top source file and confirm whether the same pattern repeats around the incident window."
        )

    if fallback:
        return fallback

    return "Remote LLM unavailable. Review the retrieved context and source files for the most relevant evidence."


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
    global _warned_embedding_fallback, _warned_prod_rate_limit_fallback

    def _pseudo_embedding(s: str, dim: int = EMBEDDING_DIM):
        # Use 1536 to match text-embedding-3-small / production embedding dimension
        seed = int(hashlib.md5(s.encode('utf-8')).hexdigest()[:16], 16)
        rnd = random.Random(seed)
        # Values in range [-0.5, 0.5]
        vec = [rnd.random() - 0.5 for _ in range(dim)]
        return vec

    # Check cache first
    demo = _is_demo_mode()
    with _lock:
        cache_key = hashlib.md5(f"{CACHE_VERSION}_{'demo' if demo else 'prod'}_embedding_{text}".encode()).hexdigest()
        if cache_key in _cache:
            vec = _cache[cache_key]
            try:
                vec = _validate_embedding(vec, text)
                print("[LLM Cache] Hit for text-embedding-3-small")
                return vec
            except ValueError as err:
                print(f"[LLM Cache] Found invalid embedding: {err}. Recomputing fallback with correct dim={EMBEDDING_DIM}.")

    try:
        if not USE_REMOTE_EMBEDDINGS or not _provider_has_embeddings():
            if not demo and not _provider_has_embeddings():
                # Provider (e.g. Groq) has no embedding API — use pseudo-embeddings silently
                global _warned_embedding_fallback
                if not _warned_embedding_fallback:
                    cfg_url = _current_ai_config().get("base_url", "")
                    print(f"[Embeddings] Provider at '{cfg_url}' does not support embeddings. Using local pseudo-embeddings.")
                    _warned_embedding_fallback = True
                vec = _pseudo_embedding(text)
                with _lock:
                    _cache[cache_key] = vec
                    _save_cache()
                return vec
            if not demo:
                raise RuntimeError("No GitHub token configured for embeddings.")
            vec = _pseudo_embedding(text)
            with _lock:
                _cache[cache_key] = vec
                _save_cache()
            return vec

        # Production mode: retry a few times before failing the pipeline.
        # Demo mode: if all retries fail, use pseudo embeddings.
        last_error = None
        for attempt in range(3):
            try:
                response = _build_client().embeddings.create(
                    model=_embedding_model(),
                    input=text,
                    timeout=30,
                )
                result = response.data[0].embedding
                result = _validate_embedding(result, text)
                with _lock:
                    _cache[cache_key] = result
                    _save_cache()
                return result
            except Exception as e:
                last_error = e
                if attempt < 2:
                    time.sleep(1.5 * (attempt + 1))

        raise RuntimeError(last_error or "timeout")
    except Exception as e:
        if not demo and not _is_rate_limit_error(e):
            raise RuntimeError(f"Embedding request failed: {e}")
        if not demo and _is_rate_limit_error(e):
            if not _warned_prod_rate_limit_fallback:
                print("Embedding API rate-limited. Using local retrieval embeddings for this run.")
                _warned_prod_rate_limit_fallback = True
            vec = _pseudo_embedding(text)
            with _lock:
                _cache[cache_key] = vec
                _save_cache()
            return vec
        if not _warned_embedding_fallback:
            print(f"Embedding request failed: {e}. Using pseudo-embedding fallback (demo mode).")
            _warned_embedding_fallback = True
        vec = _pseudo_embedding(text)
        with _lock:
            _cache[cache_key] = vec
            _save_cache()
        return vec


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Batch embedding helper. Preserves order and uses cache per text."""
    if not texts:
        return []

    demo = _is_demo_mode()
    normalized = [(t or "")[:8000] for t in texts]
    keys = [hashlib.md5(f"{CACHE_VERSION}_{'demo' if demo else 'prod'}_{_embedding_model()}_embedding_{t}".encode()).hexdigest() for t in normalized]

    out: list[list[float] | None] = [None] * len(normalized)
    missing_texts: list[str] = []
    missing_indices: list[int] = []

    with _lock:
        for i, key in enumerate(keys):
            vec = _cache.get(key)
            if vec is None:
                missing_indices.append(i)
                missing_texts.append(normalized[i])
                continue
            try:
                out[i] = _validate_embedding(vec, normalized[i])
            except ValueError:
                missing_indices.append(i)
                missing_texts.append(normalized[i])

    if missing_texts:
        global _warned_embedding_fallback, _warned_prod_rate_limit_fallback

        def _pseudo_embedding(s: str, dim: int = EMBEDDING_DIM):
            seed = int(hashlib.md5(s.encode('utf-8')).hexdigest()[:16], 16)
            rnd = random.Random(seed)
            return [rnd.random() - 0.5 for _ in range(dim)]

        if not USE_REMOTE_EMBEDDINGS or not _provider_has_embeddings():
            if not demo and not _provider_has_embeddings():
                # Provider (e.g. Groq) has no embedding API — use pseudo-embeddings silently
                global _warned_embedding_fallback
                if not _warned_embedding_fallback:
                    cfg_url = _current_ai_config().get("base_url", "")
                    print(f"[Embeddings] Provider at '{cfg_url}' does not support embeddings. Using local pseudo-embeddings.")
                    _warned_embedding_fallback = True
                computed = [_pseudo_embedding(t) for t in missing_texts]
            elif not demo:
                raise RuntimeError("No GitHub token configured for embeddings.")
            else:
                computed = [_pseudo_embedding(t) for t in missing_texts]
        else:
            batch_size = 32
            computed = []
            for start in range(0, len(missing_texts), batch_size):
                batch = missing_texts[start:start + batch_size]
                last_error = None
                batch_result = None
                for attempt in range(3):
                    try:
                        response = _build_client().embeddings.create(
                            model=_embedding_model(),
                            input=batch,
                            timeout=45,
                        )
                        batch_result = [_validate_embedding(item.embedding, batch[idx]) for idx, item in enumerate(response.data)]
                        break
                    except Exception as e:
                        last_error = e
                        if attempt < 2:
                            time.sleep(1.5 * (attempt + 1))

                if batch_result is None:
                    if demo:
                        if not _warned_embedding_fallback:
                            print(f"Embedding request failed: {last_error or 'timeout'}. Using pseudo-embedding fallback (demo mode).")
                            _warned_embedding_fallback = True
                        batch_result = [_pseudo_embedding(t) for t in batch]
                    elif _is_rate_limit_error(last_error or ""):
                        if not _warned_prod_rate_limit_fallback:
                            print("Embedding API rate-limited. Using local retrieval embeddings for this run.")
                            _warned_prod_rate_limit_fallback = True
                        batch_result = [_pseudo_embedding(t) for t in batch]
                    else:
                        raise RuntimeError(f"Embedding request failed: {last_error or 'timeout'}")

                computed.extend(batch_result)

        with _lock:
            for idx, vec in zip(missing_indices, computed):
                out[idx] = vec
                _cache[keys[idx]] = vec
            _save_cache()

    # Safety: keep output length aligned with input length.
    return [out[i] if out[i] is not None else get_embedding(normalized[i]) for i in range(len(normalized))]


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
