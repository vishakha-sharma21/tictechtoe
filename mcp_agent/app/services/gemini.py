import json
import re

from app.db.mongo import integrations_col
from app.services.llm import LlmKeyError, chat_json

PROMPT = """
You are a tool detection system.

Available tools:
- github
- google (includes google_drive, gmail, contacts)
- gmail
- google_drive
- discord

Return ONLY a JSON object of the form {{"tools": ["github"]}}.
No explanation. No markdown. No backticks.

Decide from the WHOLE conversation which tools are needed. Short replies like "yes" or "ok" continue the earlier request.
Only include a tool if the conversation clearly involves it.

Conversation:
{query}
"""


def detect_tools(query: str, user_id: str, history: list | None = None) -> list:
    """Which connectors does this conversation need?

    Small models hallucinate tools on short follow-ups ("yes do that" -> github), so the LLM's answer is only
    trusted where the conversation contains matching keywords; if the LLM finds nothing but keywords do, use those.
    Raises LlmKeyError when the user's key is missing/invalid; other failures fall back to keywords.
    """
    from app.services.orchestrator import GROUP_KEYWORDS  # local import: orchestrator imports this package too

    recent = [m for m in (history or [])[-6:] if isinstance(m, dict)]
    convo = "\n".join(f"{m.get('role', 'user')}: {str(m.get('content', ''))[:500]}" for m in recent)
    evidence = (convo + "\n" + query).lower()
    by_keyword = {g for g, rx in GROUP_KEYWORDS.items() if re.search(rx, evidence)}
    # the connectors we actually require tokens for (twilio is platform-level)
    needs_connect = lambda groups: sorted(g for g in groups if g in ("github", "google", "discord"))

    try:
        raw = chat_json(user_id, "You output only valid JSON.",
                        [{"role": "user", "content": PROMPT.format(query=(convo + "\nuser: " + query) if convo else query)}],
                        fast=True, temperature=0)
        data = json.loads(raw)
        tools = data.get("tools", []) if isinstance(data, dict) else data
        llm = {"google" if t in ("google_drive", "gmail") else t for t in tools if isinstance(t, str)}
        confirmed = llm & by_keyword
        return needs_connect(confirmed or by_keyword)
    except LlmKeyError:
        raise
    except Exception as e:
        print("Tool detection error:", type(e).__name__, str(e)[:300])
        return needs_connect(by_keyword)


def get_missing_tools(user_id: str, required_tools: list) -> list:
    doc = integrations_col.find_one({"user_id": user_id})
    if not doc:
        return required_tools
    connected = [p["provider"] for p in doc.get("providers", []) if p.get("credentials", {}).get("access_token")]
    return [t for t in required_tools if t not in connected]
