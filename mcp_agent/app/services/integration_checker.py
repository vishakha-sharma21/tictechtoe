from app.db.mongo import integrations_col


def check_missing_integrations(user_id: str, tools: list):
    missing = []

    # Get user document with all providers
    user_integration = integrations_col.find_one({
        "user_id": user_id
    })

    for tool in tools:
        # Check if provider exists in nested structure
        if not user_integration or not user_integration.get("providers", {}).get(tool):
            missing.append(tool)

    return missing