from app.db.mongo import integrations_col


def check_missing_integrations(user_id: str, tools: list):
    doc = integrations_col.find_one({ "user_id": user_id })

    if not doc:
        print(f"No document found for user_id: {user_id}")
        # Twilio is always available via env vars
        return [t for t in tools if t != "twilio"]

    providers = doc.get("providers", [])
    connected_providers = [
        p["provider"] for p in providers
        if p.get("credentials", {}).get("access_token")
    ]
    # Twilio is always available via environment variables
    connected_providers.append("twilio")
    print(f"Connected providers for {user_id}: {connected_providers}")

    missing = [t for t in tools if t not in connected_providers]
    return missing