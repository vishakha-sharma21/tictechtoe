from fastapi import APIRouter
from pymongo import MongoClient
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
client = MongoClient(os.environ["MONGODB_URI"])
db = client["nexflow"]
integrations_col = db["integrations"]

class Credentials(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[int] = None
    token_type: str = "bearer"
    scope: List[str] = []

class Meta(BaseModel):
    provider_account_id: str
    email: Optional[str] = None
    name: Optional[str] = None

class IntegrationUpsertRequest(BaseModel):
    user_id: str
    provider: str
    credentials: Credentials
    meta: Meta

@router.post("/integrations/upsert")
def upsert_integration(body: IntegrationUpsertRequest):
    now = datetime.now(timezone.utc)

    # Update nested provider structure within single user document
    result = integrations_col.update_one(
        { "user_id": body.user_id },
        {
            "$set": {
                f"providers.{body.provider}.credentials": body.credentials.dict(),
                f"providers.{body.provider}.meta": body.meta.dict(),
                "updated_at": now
            },
            "$setOnInsert": {
                "user_id": body.user_id,
                "created_at": now
            }
        },
        upsert=True
    )

    print(f"Upsert result: matched={result.matched_count} modified={result.modified_count} upserted={result.upserted_id}")
    return { "ok": True, "upserted": result.upserted_id is not None }

@router.post("/integrations/check")
def check_integration(body: dict):
    """Check if integration exists for user and provider"""
    user_id = body.get("user_id")
    provider = body.get("provider")
    
    if not user_id or not provider:
        return { "exists": False }
    
    user_integration = integrations_col.find_one({
        "user_id": user_id
    })
    
    if not user_integration:
        return { "exists": False }
    
    # Check if provider exists in nested structure
    provider_exists = bool(user_integration.get("providers", {}).get(provider))
    return { "exists": provider_exists }