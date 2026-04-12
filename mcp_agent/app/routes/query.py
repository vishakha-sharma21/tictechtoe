from fastapi import APIRouter, Body
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime, timezone
from app.services.orchestrator import run_orchestrator
from app.services.executor import execute_dag as run_dag
from app.services.gemini import detect_tools
import os
load_dotenv()

router = APIRouter()

client = MongoClient(os.environ["MONGODB_URI"])
db = client["nexflow"]
integrations_col = db["integrations"]
def get_missing_tools(user_id: str, required_tools: list):
    doc = integrations_col.find_one({ "user_id": user_id })
    if not doc:
        return required_tools
    providers = doc.get("providers", [])
    connected = [p["provider"] for p in providers if p.get("credentials", {}).get("access_token")]
    print(f"Connected providers for {user_id}: {connected}")
    return [t for t in required_tools if t not in connected]



class QueryRequest(BaseModel):
    user_id: str
    session_id: str
    query: str

class OrchestrateRequest(BaseModel):
    user_id: str
    session_id: str
    messages: list

class ExecuteDAGRequest(BaseModel):
    user_id: str
    session_id: str

GITHUB_MCP_URL = os.getenv("GITHUB_MCP_URL", "http://github_mcp:8020")
GOOGLE_MCP_URL = os.getenv("GOOGLE_MCP_URL", "http://google_mcp:8030")

def call_github_tool(tool_name: str, params: dict) -> dict:
    """
    tool_name example: "github.create_repo"
    converts to POST http://github_mcp:8020/invoke/create_repo
    """
    endpoint = tool_name.replace("github.", "")
    url = f"{GITHUB_MCP_URL}/invoke/{endpoint}"
    
    response = httpx.post(url, json=params, timeout=30)
    return response.json()

def call_google_tool(tool_name: str, params: dict) -> dict:
    """
    tool_name example: "google.gmail_send"
    converts to POST http://google_mcp:8030/invoke/gmail_send
    """
    endpoint = tool_name.replace("google.", "")
    url = f"{GOOGLE_MCP_URL}/invoke/{endpoint}"
    
    response = httpx.post(url, json=params, timeout=30)
    return response.json()

router = APIRouter()


@router.post("/process-query")
def process_query(req: QueryRequest):
    tools = detect_tools(req.query)

    missing_tools = get_missing_tools(req.user_id, tools)

    if missing_tools:
        return {
            "status": "missing_integrations",
            "required_tools": tools,
            "missing_tools": missing_tools
        }

    return {
        "status": "ready",
        "required_tools": tools
    }

@router.post("/orchestrate")
def orchestrate(body: OrchestrateRequest):
    print(f"/orchestrate for {body.user_id} | {body.session_id} | {len(body.messages)} messages")

    result = run_orchestrator(body.messages)
    status = result.get("status")

    # Save react_flow to chats collection if present (regardless of status)
    if "react_flow" in result:
        chats_col = db["chats"]
        update_result = chats_col.update_one(
            { "user_id": body.user_id, "session_id": body.session_id },
            {
                "$set": {
                    "react_flow": result["react_flow"],
                    "updated_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        print(f"Saved react_flow to chats for session {body.session_id}, status: {status}")
        print(f"Update result: matched={update_result.matched_count}, modified={update_result.modified_count}")
    else:
        print(f"No react_flow in result for status: {status}")
        print(f"Result keys: {list(result.keys())}")

    # Always append agent message to chat_history
    agent_content = result.get("message") or result.get("question") or json.dumps(result)
    chats_col = db["chats"]
    chats_col.update_one(
        { "user_id": body.user_id, "session_id": body.session_id },
        {
            "$push": {
                "chat_history": {
                    "role": "agent",
                    "content": agent_content,
                    "timestamp": datetime.now(timezone.utc)
                }
            },
            "$set": { "updated_at": datetime.now(timezone.utc) }
        }
    )

    return result

@router.post("/execute-dag")
def execute_dag_route(body: ExecuteDAGRequest):
    user_id = body.user_id
    session_id = body.session_id
    now = datetime.now(timezone.utc)

    print(f"🚀 /execute-dag user_id='{user_id}' session_id='{session_id}'")

    # List all chats to debug
    all_docs = list(db["chats"].find({}, {"user_id": 1, "session_id": 1, "_id": 0}))
    print(f"📂 All chats in nexflow: {all_docs}")

    chat = db["chats"].find_one({
        "user_id": user_id,
        "session_id": session_id
    })
    print(f"📄 Chat found: {chat is not None}")

    if not chat:
        return { "status": "error", "message": f"Chat not found for user_id={user_id} session_id={session_id}" }

    react_flow = chat.get("react_flow", {})
    nodes = react_flow.get("nodes", [])
    print(f"📋 Nodes count: {len(nodes)}")
    print(f"📋 React flow data: {react_flow}")

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
    db["chats"].update_one(
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