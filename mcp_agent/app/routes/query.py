from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth import current_user_id
from app.db.mongo import chats_col
from app.services.executor import execute_dag as run_dag
from app.services.agent_graph import reset_thread, run_turn
from app.services.llm import has_key

router = APIRouter()


# user_id is deliberately NOT part of any request body — it comes from the verified bearer token.
class MessageRequest(BaseModel):
    session_id: str
    query: str


class ExecuteDAGRequest(BaseModel):
    session_id: str


@router.post("/agent/message")
def agent_message(body: MessageRequest, user_id: str = Depends(current_user_id)):
    """One chat turn. The conversation lives server-side (LangGraph state in Mongo); the client sends only the new message."""
    if not has_key(user_id):
        return {"status": "missing_llm_key"}

    result = run_turn(user_id, body.session_id, body.query)
    status = result.get("status")
    print(f"/agent/message {user_id} | {body.session_id} -> {status}")

    if status in ("clarify", "dag_ready", "confirm", "message"):
        now = datetime.now(timezone.utc)
        update = {"$set": {"updated_at": now}}
        if "react_flow" in result:
            update["$set"]["react_flow"] = result["react_flow"]
        chats_col.update_one({"user_id": user_id, "session_id": body.session_id}, update, upsert=True)
    return result


@router.post("/execute-dag")
def execute_dag_route(body: ExecuteDAGRequest, user_id: str = Depends(current_user_id)):
    session_id = body.session_id
    now = datetime.now(timezone.utc)

    print(f"🚀 /execute-dag user_id='{user_id}' session_id='{session_id}'")

    chat = chats_col.find_one({
        "user_id": user_id,
        "session_id": session_id
    })
    print(f"📄 Chat found: {chat is not None}")

    if not chat:
        return { "status": "error", "message": f"Chat not found for user_id={user_id} session_id={session_id}" }

    react_flow = chat.get("react_flow", {})
    nodes = react_flow.get("nodes", [])
    print(f"📋 Nodes count: {len(nodes)}")

    if not nodes:
        # Check if there's any orchestration history to understand what happened
        chat_history = chat.get("chat_history", [])
        last_agent_messages = [msg for msg in chat_history if msg.get("role") == "agent"][-3:]  # Last 3 agent messages
        
        if last_agent_messages:
            print(f"🔍 Last agent messages: {[msg.get('content', '')[:100] for msg in last_agent_messages]}")
        
        return { 
            "status": "error", 
            "message": "No DAG nodes found. Please create a plan first by describing what you want to accomplish.",
            "debug": {
                "has_react_flow": bool(react_flow),
                "react_flow_keys": list(react_flow.keys()) if react_flow else [],
                "chat_history_length": len(chat_history),
                "last_agent_messages": len(last_agent_messages)
            }
        }

    # Execute all nodes via github_mcp
    execution_log = run_dag(nodes, user_id)
    all_success = all(e["success"] for e in execution_log)

    # Build colored nodes for frontend
    updated_nodes = []
    for node in nodes:
        entry = next((e for e in execution_log if e["node_id"] == node["id"]), None)
        updated_node = dict(node)
        if entry:
            updated_node["style"] = {
                "background": "#22c55e" if entry["success"] else "#ef4444",
                "color": "white",
                "border": "2px solid transparent",
                "borderRadius": "8px"
            }
            updated_node["data"] = {
                **node.get("data", {}),
                "status": "success" if entry["success"] else "error"
            }
        updated_nodes.append(updated_node)

    summary_msg = (
        f"✅ All {len(nodes)} steps completed successfully!"
        if all_success else
        f"⚠️ {sum(1 for e in execution_log if e['success'])}/{len(nodes)} steps succeeded."
    )

    # Save results to MongoDB
    chats_col.update_one(
        { "user_id": user_id, "session_id": session_id },
        {
            "$set": {
                "execution_log": execution_log,
                "completed": all_success,
                "react_flow.nodes": updated_nodes,
                "updated_at": now
            },
            "$push": {
                "chat_history": {
                    "role": "agent",
                    "content": summary_msg,
                    "timestamp": now
                }
            }
        }
    )

    if all_success:
        reset_thread(user_id, session_id)

    # Build human readable summary
    summary = []
    for entry in execution_log:
        if entry["success"]:
            r = entry.get("result", {})
            if isinstance(r, dict):
                inner = r.get("result", r)
                name = ""
                if isinstance(inner, dict):
                    name = (inner.get("name") or inner.get("full_name") 
                           or inner.get("html_url") or "")
                result_preview = f" → {name}" if name else ""
            else:
                result_preview = ""
            summary.append(f"✅ {entry['tool']}{result_preview}")
        else:
            summary.append(f"❌ {entry['tool']} — {entry.get('error', 'failed')}")

    return {
        "status": "completed" if all_success else "partial",
        "message": summary_msg,
        "summary": summary,
        "execution_log": execution_log,
        "updated_nodes": updated_nodes,
        "completed": all_success
    }