from fastapi import APIRouter
from pydantic import BaseModel
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import Optional, List
from datetime import datetime, timezone
import os

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

    # Find the ONE document for this user
    existing = integrations_col.find_one({ "user_id": body.user_id })

    if not existing:
        print(f"ERROR: No document found for user_id: {body.user_id}")
        return { "ok": False, "error": f"No user found with user_id: {body.user_id}" }

    print(f"Found document for user_id: {body.user_id}")

    new_provider_entry = {
        "provider": body.provider,
        "credentials": body.credentials.dict(),
        "meta": body.meta.dict(),
        "connected_at": now
    }

    # Check if provider already exists in providers array
    providers = existing.get("providers", [])
    provider_exists = any(p["provider"] == body.provider for p in providers)

    if not provider_exists:
        # Push new provider into array
        result = integrations_col.update_one(
            { "user_id": body.user_id },
            {
                "$push": { "providers": new_provider_entry },
                "$set": { "updated_at": now }
            }
        )
        print(f"Added new provider '{body.provider}' for user '{body.user_id}'")
    else:
        # Update existing provider entry in array
        result = integrations_col.update_one(
            { "user_id": body.user_id, "providers.provider": body.provider },
            {
                "$set": {
                    "providers.$.credentials": body.credentials.dict(),
                    "providers.$.meta": body.meta.dict(),
                    "providers.$.connected_at": now,
                    "updated_at": now
                }
            }
        )
        print(f"Updated existing provider '{body.provider}' for user '{body.user_id}'")

    return { "ok": True }

@router.post("/integrations/init")
def init_user_integration(body: dict):
    user_id = body.get("user_id")
    email = body.get("email")
    if not user_id:
        return { "ok": False, "error": "user_id is required" }
    now = datetime.now(timezone.utc)
    existing = integrations_col.find_one({ "user_id": user_id })
    if existing:
        return { "ok": True, "exists": True }
    new_user_doc = {
        "user_id": user_id,
        "providers": [],
        "meta": {"email": email} if email else {},
        "created_at": now,
        "updated_at": now
    }
    result = integrations_col.insert_one(new_user_doc)
    print(f"Created user document for user_id: {user_id}")
    return { "ok": True, "exists": False, "created_id": str(result.inserted_id) }

@router.post("/integrations/upsert-by-email")
def upsert_by_email(body: dict):
    now = datetime.now(timezone.utc)
    email = body.get("email")
    provider = body.get("provider")

    # Find document by email in meta field
    existing = integrations_col.find_one({ 
        "meta.email": email 
    })

    if not existing:
        print(f"ERROR: No document found for email: {email}")
        return { "ok": False, "error": f"No user found with email: {email}" }

    user_id = existing["user_id"]
    print(f"Found user_id: {user_id} for email: {email}")

    new_provider_entry = {
        "provider": provider,
        "credentials": body.get("credentials", {}),
        "meta": body.get("meta", {}),
        "connected_at": now
    }

    providers = existing.get("providers", [])
    provider_exists = any(p["provider"] == provider for p in providers)

    if not provider_exists:
        integrations_col.update_one(
            { "user_id": user_id },
            {
                "$push": { "providers": new_provider_entry },
                "$set": { "updated_at": now }
            }
        )
        print(f"Added provider '{provider}' for user '{user_id}'")
    else:
        integrations_col.update_one(
            { "user_id": user_id, "providers.provider": provider },
            {
                "$set": {
                    "providers.$.credentials": body.get("credentials", {}),
                    "providers.$.meta": body.get("meta", {}),
                    "providers.$.connected_at": now,
                    "updated_at": now
                }
            }
        )
        print(f"Updated provider '{provider}' for user '{user_id}'")

    return { "ok": True, "user_id": user_id }

@router.post("/integrations/check")
def check_integration(body: dict):
    user_id = body.get("user_id")
    provider = body.get("provider")
    
    doc = integrations_col.find_one({ "user_id": user_id })
    if not doc:
        return { "connected": False }
    
    providers = doc.get("providers", [])
    connected = any(
        p["provider"] == provider and p.get("credentials", {}).get("access_token")
        for p in providers
    )
    return { "connected": connected }