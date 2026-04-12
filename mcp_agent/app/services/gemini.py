from fastapi import APIRouter
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from openai import OpenAI
import os
import json
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

# MongoDB
mongo_client = MongoClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
db = mongo_client.get_database("nexflow")
integrations_col = db["integrations"]

# OpenAI
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# ── Request model ──────────────────────────────────────────
class QueryRequest(BaseModel):
    user_id: str
    session_id: str
    query: str


# ── Tool detection ─────────────────────────────────────────
def detect_tools(query: str):
    prompt = f"""
You are a tool detection system.

Available tools:
- github
- google (includes google_drive, gmail, contacts)
- gmail
- google_drive

Return ONLY a JSON array.
No explanation.
No markdown.
No backticks.

Example:
["github"]

User query:
{query}
"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You output only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
        )
        text = response.choices[0].message.content.strip()
        print("🔍 GPT RAW OUTPUT:", text)
        text = text.replace("```json", "").replace("```", "").strip()
        tools = json.loads(text)
        
        # Normalize tool names
        normalized_tools = []
        for tool in tools:
            if tool == "google_drive":
                normalized_tools.append("google")
            elif tool == "gmail":
                normalized_tools.append("google")
            else:
                normalized_tools.append(tool)
        
        return normalized_tools
    except Exception as e:
        print(" GPT Error:", e)
        return []


# ── Check integrations ─────────────────────────────────────
def get_missing_tools(user_id: str, required_tools: list):
    doc = integrations_col.find_one({ "user_id": user_id })
    print(f"Looking for user_id: '{user_id}' -> found: {doc is not None}")
    
    if not doc:
        print(f"No document found for user_id: {user_id}")
        return required_tools

    providers = doc.get("providers", [])
    print(f"Providers in doc: {[p['provider'] for p in providers]}")
    
    connected_providers = [
        p["provider"] for p in providers
        if p.get("credentials", {}).get("access_token")
    ]
    print(f"Connected providers for {user_id}: {connected_providers}")

    missing = [t for t in required_tools if t not in connected_providers]
    return missing


# ── Route ──────────────────────────────────────────────────
@router.post("/process-query")
def process_query(body: QueryRequest):
    print(f"📨 Query from {body.user_id} | session {body.session_id}: {body.query}")

    required_tools = detect_tools(body.query)
    print(f"🔧 Required tools: {required_tools}")

    missing_tools = get_missing_tools(body.user_id, required_tools)
    print(f"❌ Missing tools: {missing_tools}")

    if missing_tools:
        return {
            "status": "missing_integrations",
            "required_tools": required_tools,
            "missing_tools": missing_tools
        }

    return {
        "status": "ready",
        "required_tools": required_tools
    }