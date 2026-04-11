from fastapi import APIRouter, Body
from pydantic import BaseModel
import json
from app.models.schema import QueryRequest
from app.services.gemini import detect_tools
from app.services.integration_checker import check_missing_integrations
from app.services.orchestrator import run_orchestrator
from datetime import datetime, timezone
from app.db.mongo import db

router = APIRouter()

class OrchestrateRequest(BaseModel):
    user_id: str
    session_id: str
    messages: list


@router.post("/process-query")
def process_query(req: QueryRequest):
    tools = detect_tools(req.query)

    missing_tools = check_missing_integrations(req.user_id, tools)

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

    # If DAG is ready, save react_flow to chats collection
    if status == "dag_ready" and "react_flow" in result:
        chats_col = db["chats"]
        chats_col.update_one(
            { "user_id": body.user_id, "session_id": body.session_id },
            {
                "$set": {
                    "react_flow": result["react_flow"],
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        print(f"Saved react_flow to chats for session {body.session_id}")

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
def execute_dag(body: dict = Body(...)):
    user_id = body.get("user_id")
    session_id = body.get("session_id")

    # Fetch the execution plan from chats
    chat = db["chats"].find_one({ "user_id": user_id, "session_id": session_id })
    react_flow = chat.get("react_flow", {})
    nodes = react_flow.get("nodes", [])

    print(f"Executing DAG for {user_id} | {session_id}")
    print(f"Nodes to execute: {[n['data']['tool'] for n in nodes]}")

    # TODO: actual execution in next step
    # For now just return the plan
    return {
        "status": "executing",
        "message": f"Starting execution of {len(nodes)} steps...",
        "nodes": [n["data"]["tool"] for n in nodes]
    }