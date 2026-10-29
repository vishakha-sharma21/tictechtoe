"""Per-user LLM access. Each user supplies their own OpenAI or Anthropic key (stored encrypted)."""
import json
import os
import re
import time

import anthropic
import openai

from app.crypto import decrypt
from app.db.mongo import llm_keys_col

# Provider registry. Groq and OpenRouter speak the OpenAI wire format, so they reuse the OpenAI SDK
# with a different base_url. Hosted open-model names get retired often, so each tier is a PREFERENCE LIST:
# we ask the provider which models the key can actually use (cached) and take the first match.
# Pin a model explicitly with e.g. GROQ_MODEL_SMART / GROQ_MODEL_FAST.
PROVIDERS = {
    "openai": {"base_url": None, "smart": ["gpt-4o"], "fast": ["gpt-4o-mini"]},
    "anthropic": {"base_url": None, "smart": ["claude-sonnet-5-5"], "fast": ["claude-haiku-5-5"]},
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "smart": ["openai/gpt-oss-120b", "llama-3.3-70b-versatile", "qwen/qwen3.8-27b"],
        "fast": ["openai/gpt-oss-20b", "llama-3.1-8b-instant", "openai/gpt-oss-120b"],
    },
    # Google's OpenAI-compatible endpoint. Model names are picked from the live list (see _pick_gemini).
    "gemini": {
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
        "smart": ["gemini-2.5-pro"], "fast": ["gemini-2.5-flash"],
    },
    "openrouter": {
        "base_url": "https://openrouter.ai/api/v1",
        "smart": ["openai/gpt-oss-120b", "meta-llama/llama-3.3-70b-instruct"],
        "fast": ["openai/gpt-oss-20b", "meta-llama/llama-3.1-8b-instruct"],
    },
}

_available_cache: dict[tuple[str, str], tuple[float, set[str]]] = {}  # (provider, key tail) -> (expires, model ids)


def _available_models(provider: str, key: str) -> set[str]:
    cache_key = (provider, key[-8:])
    hit = _available_cache.get(cache_key)
    if hit and hit[0] > time.time():
        return hit[1]
    try:
        ids = {m.id.removeprefix("models/") for m in openai.OpenAI(api_key=key, base_url=PROVIDERS[provider]["base_url"], timeout=20).models.list().data}
    except Exception:
        ids = set()  # can't list -> fall back to the first preference
    _available_cache[cache_key] = (time.time() + 3600, ids)
    return ids


_GEMINI_SKIP = ("lite", "tts", "image", "live", "audio", "transcribe", "computer", "customtools", "embedding", "thinking", "robotics")
_dead_models: dict[tuple[str, str], float] = {}  # (key tail, model) -> until-when to skip it


def _mark_dead(key: str, model: str, seconds: int) -> None:
    _dead_models[(key[-8:], model)] = time.time() + seconds


def _gemini_candidates(available: set, fast: bool) -> list[str]:
    """Ranked Gemini models: stable before preview, then newest version. Smart tier = pro family first, flash as
    fallback. A model being LISTED doesn't mean it's usable (old ones are retired for new keys, new ones get overloaded),
    so callers walk this list and skip models that recently failed."""
    def family(kind: str) -> list[str]:
        found = []
        for name in available:
            m = re.fullmatch(rf"gemini-(\d+(?:\.\d+)?)-{kind}(-preview[\w.-]*)?", name)
            if m and not any(w in name for w in _GEMINI_SKIP):
                found.append(((m.group(2) is None), float(m.group(1)), name))
        return [n for _, _, n in sorted(found, reverse=True)]
    return family("flash") if fast else family("pro") + family("flash")


def _model_candidates(provider: str, key: str, fast: bool) -> list[str]:
    """Models to try, best first. Only Gemini has more than one; everything else is a single deterministic pick."""
    if provider == "gemini" and not os.getenv(f"GEMINI_MODEL_{'FAST' if fast else 'SMART'}"):
        now = time.time()
        live = [m for m in _gemini_candidates(_available_models(provider, key), fast)
                if _dead_models.get((key[-8:], m), 0) < now]
        if live:
            return live[:6]
    return [_model(provider, key, fast)]


def _model(provider: str, key: str, fast: bool) -> str:
    override = os.getenv(f"{provider.upper()}_MODEL_{'FAST' if fast else 'SMART'}")
    if override:
        return override
    prefs = PROVIDERS[provider]["fast" if fast else "smart"]
    if provider == "gemini":
        picked = _model_candidates(provider, key, fast)
        if picked:
            return picked[0]
    if provider in ("groq", "openrouter"):
        available = _available_models(provider, key)
        for name in prefs:
            if name in available:
                return name
        print(f"No preferred {provider} model is available (wanted {prefs}).")
    return prefs[0]


class LlmTooLarge(Exception):
    """Single request exceeds the provider's per-request/minute token cap (e.g. Groq free tier, HTTP 413)."""


class LlmProviderBusy(Exception):
    """Provider is down/overloaded (5xx, timeouts) on every model we tried."""


class LlmRateLimited(Exception):
    """Provider kept returning 429 (e.g. Groq free-tier tokens-per-minute)."""


class LlmKeyError(Exception):
    """No usable key for this user (missing, undecryptable, or rejected by the provider)."""


def get_user_key(user_id: str) -> tuple[str, str]:
    doc = llm_keys_col.find_one({"user_id": user_id, "is_default": True}) or llm_keys_col.find_one({"user_id": user_id})
    if not doc:
        raise LlmKeyError("no key")
    try:
        return doc["provider"], decrypt(doc["key_enc"])
    except Exception:
        raise LlmKeyError("key could not be decrypted")


def get_user_provider(user_id: str) -> str | None:
    doc = llm_keys_col.find_one({"user_id": user_id, "is_default": True}) or llm_keys_col.find_one({"user_id": user_id})
    return doc["provider"] if doc else None


def has_key(user_id: str) -> bool:
    return llm_keys_col.count_documents({"user_id": user_id}, limit=1) > 0


def _extract_json(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?|```$", "", text, flags=re.M).strip()
    if text.startswith("{") or text.startswith("["):
        return text
    m = re.search(r"[\[{].*[\]}]", text, flags=re.S)
    return m.group(0) if m else text


def _alternate(messages: list[dict]) -> list[dict]:
    """Anthropic needs user-first, strictly alternating roles."""
    out: list[dict] = []
    for m in messages:
        role = "assistant" if m["role"] == "assistant" else "user"
        content = str(m["content"])
        if out and out[-1]["role"] == role:
            out[-1]["content"] += "\n\n" + content
        else:
            out.append({"role": role, "content": content})
    if not out or out[0]["role"] != "user":
        out.insert(0, {"role": "user", "content": "(start)"})
    return out


def _chat_json_once(user_id: str, system: str, messages: list[dict], fast: bool = False, temperature: float = 0.2) -> str:
    """Returns the model's JSON reply as a string. Raises LlmKeyError if the user's key is missing/invalid."""
    provider, key = get_user_key(user_id)
    last: Exception | None = None
    for model in _model_candidates(provider, key, fast):
        try:
            return _call_model(provider, key, model, system, messages, fast, temperature)
        except openai.NotFoundError as e:       # retired / unavailable for this key: don't try it again for an hour
            _mark_dead(key, model, 3600)
            print(f"Model {model} unavailable (404) — trying next")
            last = e
        except openai.RateLimitError as e:
            if provider != "gemini":
                raise  # other providers: a 429 is account-wide, handled by the wait-and-retry in chat_json
            # Gemini quotas are PER MODEL (a newer model may have none on a free key), so use another model
            _mark_dead(key, model, 900)
            print(f"Model {model} out of quota (429) — trying next")
            last = e
        except openai.InternalServerError as e:  # e.g. 503 "high demand": skip it briefly
            _mark_dead(key, model, 120)
            print(f"Model {model} overloaded ({e.status_code}) — trying next")
            last = e
    raise last  # every candidate failed


def _call_model(provider: str, key: str, model: str, system: str, messages: list[dict], fast: bool, temperature: float) -> str:
    try:
        if provider == "anthropic":
            client = anthropic.Anthropic(api_key=key)
            resp = client.messages.create(
                model=model,
                max_tokens=4096,
                temperature=temperature,
                system=system + "\n\nRespond with a single valid JSON value and nothing else.",
                messages=_alternate(messages),
            )
            return _extract_json("".join(b.text for b in resp.content if b.type == "text"))

        # OpenAI + OpenAI-compatible hosts (Groq, OpenRouter)
        client = openai.OpenAI(api_key=key, base_url=PROVIDERS[provider]["base_url"], timeout=25 if provider == "gemini" else 60)  # Gemini: fail over fast
        extra = {"reasoning_effort": "low"} if fast and model.startswith("openai/gpt-oss") else None
        kwargs = dict(
            model=model,
            **({"extra_body": extra} if extra else {}),
            messages=[{"role": "system", "content": system}, *messages],
            temperature=temperature,
        )
        try:
            resp = client.chat.completions.create(**kwargs, response_format={"type": "json_object"})
        except openai.BadRequestError as e:
            raw = (str(e) + " " + (getattr(e.response, "text", "") or "")).lower()  # SDK drops list-shaped error bodies
            if "api key not valid" in raw or "api_key_invalid" in raw:  # Gemini reports a bad key as HTTP 400
                raise LlmKeyError("provider rejected key")
            # Some hosted models don't support JSON mode — retry as plain text and extract the JSON.
            resp = client.chat.completions.create(
                **{**kwargs, "messages": [{"role": "system", "content": system + "\n\nRespond with a single valid JSON value and nothing else."}, *messages]}
            )
        return _extract_json(resp.choices[0].message.content or "")
    except (openai.AuthenticationError, openai.PermissionDeniedError,
            anthropic.AuthenticationError, anthropic.PermissionDeniedError):
        raise LlmKeyError("provider rejected key")


def parse_json(raw: str):
    return json.loads(raw)


def chat_json(user_id: str, system: str, messages: list[dict], fast: bool = False, temperature: float = 0.2) -> str:
    """Like _chat_json_once, but waits out short provider rate limits (Groq's free tier is 6-8k tokens/min)."""
    for attempt in range(3):
        try:
            return _chat_json_once(user_id, system, messages, fast, temperature)
        except (openai.RateLimitError, anthropic.RateLimitError) as e:
            m = re.search(r"try again in ([\d.]+)\s*(ms|s)\b", str(e))
            wait = (float(m.group(1)) / (1000 if m.group(2) == "ms" else 1)) if m else 4.0
            print(f"Rate limited (attempt {attempt + 1}); waiting {wait:.1f}s")
            if attempt == 2 or wait > 20:
                raise LlmRateLimited(str(e)[:200])
            time.sleep(wait + 0.5)
        except (openai.InternalServerError, openai.APIConnectionError, openai.APITimeoutError) as e:
            raise LlmProviderBusy(str(e)[:200])
        except openai.APIStatusError as e:  # (RateLimitError is handled above; this is e.g. 413 Request too large)
            if e.status_code == 413:
                raise LlmTooLarge(str(e)[:200])
            raise
