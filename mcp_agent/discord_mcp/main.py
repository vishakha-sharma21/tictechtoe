from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

mongo_client = MongoClient(os.environ["MONGODB_URI"])
db = mongo_client["nexflow"]
integrations_col = db["integrations"]

DISCORD_API_BASE = "https://discord.com/api/v10"

def get_discord_token(user_id: str) -> str:
    doc = integrations_col.find_one({"user_id": user_id})
    if not doc:
        raise ValueError(f"No integration found for user_id: {user_id}")
    providers = doc.get("providers", [])
    discord = next((p for p in providers if p["provider"] == "discord"), None)
    if not discord:
        raise ValueError(f"No Discord provider for user_id: {user_id}")
    token = discord["credentials"].get("access_token")
    if not token:
        raise ValueError(f"No Discord access_token for user_id: {user_id}")
    return token

def make_discord_request(user_id: str, method: str, endpoint: str, **kwargs):
    token = get_discord_token(user_id)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        **kwargs.pop("headers", {})
    }
    with httpx.Client() as client:
        response = client.request(
            method,
            f"{DISCORD_API_BASE}/{endpoint}",
            headers=headers,
            **kwargs
        )
        if response.status_code == 204:
            return {"success": True, "message": "Operation successful"}
        if response.status_code >= 400:
            error_msg = f"Discord API error {response.status_code}"
            if response.status_code == 401:
                error_msg = "Discord authentication failed"
            elif response.status_code == 403:
                error_msg = "Discord permission denied"
            elif response.status_code == 404:
                error_msg = "Discord resource not found"
            raise HTTPException(status_code=response.status_code, detail=error_msg)
        return response.json()

app = FastAPI()

# Request Models
class BaseRequest(BaseModel):
    user_id: str

class SendMessageRequest(BaseRequest):
    channel_id: str
    content: str
    embeds: Optional[List[Dict]] = None

class GetMessagesRequest(BaseRequest):
    channel_id: str
    limit: int = 10

class SendDMRequest(BaseRequest):
    discord_user_id: str
    content: str

class ListChannelsRequest(BaseRequest):
    guild_id: str

class GetServerInfoRequest(BaseRequest):
    guild_id: str

class AddReactionRequest(BaseRequest):
    channel_id: str
    message_id: str
    emoji: str

class CreateChannelRequest(BaseRequest):
    guild_id: str
    name: str
    channel_type: int = 0
    topic: Optional[str] = None
    is_private: bool = False

class GetUserRequest(BaseRequest):
    discord_user_id: str

class DeleteMessageRequest(BaseRequest):
    channel_id: str
    message_id: str

class ListServersRequest(BaseRequest):
    pass

# Tool Implementations
@app.post("/invoke/discord.send_message")
def send_message(req: SendMessageRequest):
    try:
        payload = {"content": req.content}
        if req.embeds:
            payload["embeds"] = req.embeds
        data = make_discord_request(req.user_id, "POST", f"channels/{req.channel_id}/messages", json=payload)
        return {"result": {"message_id": data["id"], "channel_id": data["channel_id"], "content": data["content"]}}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.get_messages")
def get_messages(req: GetMessagesRequest):
    try:
        data = make_discord_request(req.user_id, "GET", f"channels/{req.channel_id}/messages", params={"limit": req.limit})
        return {"result": [{"id": m["id"], "content": m["content"], "author": m["author"]["username"], "timestamp": m["timestamp"]} for m in data]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.send_dm")
def send_dm(req: SendDMRequest):
    try:
        # Create DM channel first
        dm_channel = make_discord_request(req.user_id, "POST", "users/@me/channels", json={"recipient_id": req.discord_user_id})
        channel_id = dm_channel["id"]
        # Send message
        data = make_discord_request(req.user_id, "POST", f"channels/{channel_id}/messages", json={"content": req.content})
        return {"result": {"message_id": data["id"], "channel_id": channel_id}}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.list_channels")
def list_channels(req: ListChannelsRequest):
    try:
        data = make_discord_request(req.user_id, "GET", f"guilds/{req.guild_id}/channels")
        return {"result": [{"id": c["id"], "name": c["name"], "type": c["type"], "topic": c.get("topic")} for c in data]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.get_server_info")
def get_server_info(req: GetServerInfoRequest):
    try:
        data = make_discord_request(req.user_id, "GET", f"guilds/{req.guild_id}")
        return {"result": {"id": data["id"], "name": data["name"], "member_count": data.get("approximate_member_count"), "description": data.get("description"), "owner_id": data["owner_id"]}}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.add_reaction")
def add_reaction(req: AddReactionRequest):
    try:
        make_discord_request(req.user_id, "PUT", f"channels/{req.channel_id}/messages/{req.message_id}/reactions/{req.emoji}/@me")
        return {"result": {"success": True, "emoji": req.emoji}}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.create_channel")
def create_channel(req: CreateChannelRequest):
    try:
        payload = {"name": req.name, "type": req.channel_type}
        if req.topic:
            payload["topic"] = req.topic
        if req.is_private:
            payload["type"] = 2  # private channel
        data = make_discord_request(req.user_id, "POST", f"guilds/{req.guild_id}/channels", json=payload)
        return {"result": {"id": data["id"], "name": data["name"], "type": data["type"]}}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.get_user")
def get_user(req: GetUserRequest):
    try:
        data = make_discord_request(req.user_id, "GET", f"users/{req.discord_user_id}")
        return {"result": {"id": data["id"], "username": data["username"], "discriminator": data.get("discriminator"), "avatar": data.get("avatar")}}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.delete_message")
def delete_message(req: DeleteMessageRequest):
    try:
        make_discord_request(req.user_id, "DELETE", f"channels/{req.channel_id}/messages/{req.message_id}")
        return {"result": {"success": True, "message_id": req.message_id}}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/discord.list_servers")
def list_servers(req: ListServersRequest):
    try:
        data = make_discord_request(req.user_id, "GET", "users/@me/guilds")
        return {"result": [{"id": g["id"], "name": g["name"], "owner": g["owner"], "permissions": g["permissions"]} for g in data]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/tools")
def list_tools():
    return {
        "tools": [
            {
                "name": "discord.send_message",
                "description": "Send a message to a Discord channel",
                "input_schema": SendMessageRequest.model_json_schema()
            },
            {
                "name": "discord.get_messages",
                "description": "Get recent messages from a Discord channel",
                "input_schema": GetMessagesRequest.model_json_schema()
            },
            {
                "name": "discord.send_dm",
                "description": "Send a direct message to a Discord user",
                "input_schema": SendDMRequest.model_json_schema()
            },
            {
                "name": "discord.list_channels",
                "description": "List all channels in a Discord server",
                "input_schema": ListChannelsRequest.model_json_schema()
            },
            {
                "name": "discord.get_server_info",
                "description": "Get information about a Discord server",
                "input_schema": GetServerInfoRequest.model_json_schema()
            },
            {
                "name": "discord.add_reaction",
                "description": "Add a reaction to a Discord message",
                "input_schema": AddReactionRequest.model_json_schema()
            },
            {
                "name": "discord.create_channel",
                "description": "Create a new channel in a Discord server",
                "input_schema": CreateChannelRequest.model_json_schema()
            },
            {
                "name": "discord.get_user",
                "description": "Get information about a Discord user",
                "input_schema": GetUserRequest.model_json_schema()
            },
            {
                "name": "discord.delete_message",
                "description": "Delete a message from a Discord channel",
                "input_schema": DeleteMessageRequest.model_json_schema()
            },
            {
                "name": "discord.list_servers",
                "description": "List all Discord servers the user is in",
                "input_schema": ListServersRequest.model_json_schema()
            }
        ]
    }
