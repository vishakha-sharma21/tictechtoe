"""LangGraph workflow for the chat agent.

The server owns the conversation: state is checkpointed in MongoDB per (user, chat) thread, so the browser only
sends the NEW message. History is kept bounded and compact (plans are stored as steps, not full DAG JSON), which keeps
prompts small enough for free-tier models.

    START -> detect -+-> blocked -> END              (a connector or the LLM key is missing)
                     +-> ingest -> plan -+-> finish -> END
                                         +-> plan (validation failed -> retry with feedback)
                                         +-> giveup -> END
"""
import json
from typing import Annotated, Optional, TypedDict

from langgraph.checkpoint.mongodb import MongoDBSaver
from langgraph.graph import END, START, StateGraph

from app.db.mongo import DB_NAME, client
from app.services.gemini import detect_tools, get_missing_tools
from app.services.llm import LlmKeyError, LlmProviderBusy, LlmRateLimited, LlmTooLarge, chat_json, get_user_provider
from app.services.orchestrator import MAX_RETRIES, WEAK_PROVIDERS, build_prompt
from app.services.plan import normalize_plan, validate_plan

MAX_MESSAGES = 10          # conversation turns kept in state
CHECKPOINT_TTL = 7 * 24 * 3600  # abandoned chats are forgotten after a week


def _bounded(old: list, new: list) -> list:
    merged = (old or []) + (new or [])
    merged = merged[-MAX_MESSAGES:]
    while merged and merged[0]["role"] != "user":  # providers need a user-first conversation
        merged = merged[1:]
    return merged


class AgentState(TypedDict, total=False):
    user_id: str
    query: str
    messages: Annotated[list, _bounded]
    plan: Optional[dict]        # compact form of the latest dag_ready plan
    required_tools: list
    missing_tools: list
    feedback: list              # validation feedback turns for the CURRENT request only
    attempts: int
    result: Optional[dict]      # what the API returns


def compact_result(result: dict) -> dict:
    """What we remember about a reply: enough for the model to continue, without node geometry."""
    if result.get("status") == "dag_ready":
        nodes = [{"id": n.get("id"), "tool": n["data"].get("tool"), "params": n["data"].get("params")}
                 for n in result.get("react_flow", {}).get("nodes", [])]
        return {"status": "dag_ready", "summary": result.get("summary"), "nodes": nodes}
    return {k: v for k, v in result.items() if k in ("status", "question", "message")}


# ── nodes ──────────────────────────────────────────────────────────────────────────────────────────────────────────
def detect(state: AgentState) -> dict:
    user_id, query = state["user_id"], state["query"]
    try:
        tools = detect_tools(query, user_id, state.get("messages", []))
    except LlmKeyError:
        return {"result": {"status": "missing_llm_key"}}
    except LlmRateLimited:
        return {"result": _rate_limited()}
    missing = get_missing_tools(user_id, tools)
    if missing:
        return {"required_tools": tools, "missing_tools": missing,
                "result": {"status": "missing_integrations", "required_tools": tools, "missing_tools": missing}}
    return {"required_tools": tools, "missing_tools": [], "result": None}


def ingest(state: AgentState) -> dict:
    return {"messages": [{"role": "user", "content": state["query"]}], "feedback": [], "attempts": 0, "result": None}


def _history_for_prompt(messages: list, has_plan: bool) -> list:
    """The full current plan is already sent as CURRENT PLAN, so don't repeat its nodes inside the chat history."""
    out = []
    for m in messages:
        content = m["content"] if isinstance(m["content"], str) else json.dumps(m["content"])
        if has_plan and m["role"] == "assistant" and '"nodes"' in content:
            try:
                d = json.loads(content)
                content = json.dumps({"status": d.get("status"), "summary": d.get("summary"), "nodes": "(see CURRENT PLAN)"})
            except Exception:
                pass
        out.append({"role": m["role"], "content": content})
    return out


def plan(state: AgentState) -> dict:
    user_id = state["user_id"]
    weak = get_user_provider(user_id) in WEAK_PROVIDERS
    current = state.get("plan")

    def make_system(lean: bool) -> str:
        system = build_prompt(state["messages"], weak, lean=lean)
        if current:
            system += ("\n\nCURRENT PLAN (already shown to the user — keep it unless they ask for changes; "
                       "if you change it, return the full updated plan):\n" + json.dumps(current, separators=(",", ":")))
        return system

    convo = _history_for_prompt(state["messages"], bool(current)) + state.get("feedback", [])
    temperature = 0.1 if weak else 0.2
    try:
        try:
            raw = chat_json(user_id, make_system(False), convo, fast=False, temperature=temperature)
        except LlmTooLarge:
            if not weak:
                raise
            print("Request too large for provider tier — retrying with a lean prompt")
            raw = chat_json(user_id, make_system(True), convo, fast=False, temperature=temperature)
    except LlmKeyError:
        return {"result": {"status": "missing_llm_key"}}
    except LlmRateLimited:
        return {"result": _rate_limited()}
    except LlmProviderBusy:
        name = {"gemini": "Gemini", "groq": "Groq", "openrouter": "OpenRouter", "openai": "OpenAI", "anthropic": "Claude"}.get(
            get_user_provider(user_id) or "", "Your AI provider")
        return {"result": {"status": "message", "_transient": True, "message":
                f"{name} is overloaded or out of free quota right now (its servers are refusing requests, not DAGent). "
                "Wait a few minutes and send that again, or switch provider: click the key icon in the sidebar and press "
                "\"Use this\" on another saved key."}}
    except LlmTooLarge:
        return {"result": {"status": "message", "_transient": True, "message":
                "This request is too large for your AI provider's free tier (it caps a single request at ~8,000 tokens). "
                "Split it into smaller parts — e.g. the GitHub steps first, then Google, then Discord/Twilio — "
                "or add a paid/higher-limit key in AI provider settings."}}
    except Exception as e:
        print(f"Plan error: {type(e).__name__}: {str(e)[:300]}")
        return {"result": {"status": "message", "_transient": True, "message": "Something went wrong. Please try again."}}

    print(f"Agent plan (attempt {state.get('attempts', 0) + 1}): {raw[:200]}...")
    try:
        result = normalize_plan(json.loads(raw))
        errors = validate_plan(result)
    except json.JSONDecodeError:
        result, errors = None, ["Your reply was not valid JSON. Reply with ONE JSON object only."]
    if not errors:
        return {"result": result}
    print(f"Plan rejected: {errors}")
    return {"attempts": state.get("attempts", 0) + 1, "result": None,
            "feedback": state.get("feedback", []) + [
                {"role": "assistant", "content": raw},
                {"role": "user", "content": "Your previous reply was invalid:\n- " + "\n- ".join(errors[:8])
                 + "\nReturn the corrected JSON object only."}]}


def finish(state: AgentState) -> dict:
    result = state["result"]
    update: dict = {"messages": [{"role": "assistant", "content": json.dumps(compact_result(result))}]}
    if result.get("status") == "dag_ready":
        update["plan"] = compact_result(result)
    return update


def giveup(state: AgentState) -> dict:
    return {"result": {"status": "message", "message": "I couldn't produce a valid plan with the current model. "
                       "Try rephrasing, or switch to a stronger model in AI provider settings."}}


def _rate_limited() -> dict:
    return {"status": "message", "_transient": True, "message": "Your AI provider's rate limit was hit (free tiers allow "
            "only a few thousand tokens per minute). Wait ~30 seconds and send that again."}


# ── wiring ─────────────────────────────────────────────────────────────────────────────────────────────────────────
def _after_detect(state: AgentState) -> str:
    return "blocked" if state.get("result") else "ingest"


def _after_plan(state: AgentState) -> str:
    r = state.get("result")
    if r is None:
        return "plan" if state.get("attempts", 0) <= MAX_RETRIES else "giveup"
    # key/rate-limit/error replies must not be remembered as conversation turns
    return "finish" if r.get("status") in ("clarify", "dag_ready", "confirm", "message") and not r.get("_transient") else "end"


def _build():
    g = StateGraph(AgentState)
    g.add_node("detect", detect)
    g.add_node("ingest", ingest)
    g.add_node("plan", plan)
    g.add_node("finish", finish)
    g.add_node("giveup", giveup)
    g.add_edge(START, "detect")
    g.add_conditional_edges("detect", _after_detect, {"blocked": END, "ingest": "ingest"})
    g.add_edge("ingest", "plan")
    g.add_conditional_edges("plan", _after_plan, {"plan": "plan", "finish": "finish", "giveup": "giveup", "end": END})
    g.add_edge("finish", END)
    g.add_edge("giveup", END)
    return g.compile(checkpointer=checkpointer)


checkpointer = MongoDBSaver(client, db_name=DB_NAME, ttl=CHECKPOINT_TTL)
graph = _build()


def thread_config(user_id: str, session_id: str) -> dict:
    return {"configurable": {"thread_id": f"{user_id}:{session_id}"}}


def run_turn(user_id: str, session_id: str, query: str) -> dict:
    out = graph.invoke({"user_id": user_id, "query": query, "result": None}, thread_config(user_id, session_id))
    result = dict(out["result"])
    result.pop("_transient", None)
    return result


def reset_thread(user_id: str, session_id: str) -> None:
    """Forget a chat's agent state (called after a workflow finishes, so the next task starts clean)."""
    checkpointer.delete_thread(f"{user_id}:{session_id}")
