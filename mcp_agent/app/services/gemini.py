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
- google
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
        return json.loads(text)
    except Exception as e:
        print("❌ GPT Error:", e)
        return []


# ── Check integrations ─────────────────────────────────────
def get_missing_tools(user_id: str, required_tools: list):
    missing = []
    for tool in required_tools:
        doc = integrations_col.find_one({
            "user_id": user_id,
            "provider": tool
        })
        if not doc or not doc.get("credentials", {}).get("access_token"):
            missing.append(tool)
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