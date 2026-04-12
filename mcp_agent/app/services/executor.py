import httpx
import os
from datetime import datetime, timezone

GITHUB_MCP_URL = os.getenv("GITHUB_MCP_URL", "http://github_mcp:8020")
GOOGLE_MCP_URL = os.getenv("GOOGLE_MCP_URL", "http://google_mcp:8030")
DISCORD_MCP_URL = os.getenv("DISCORD_MCP_URL", "http://discord_mcp:8040")
TWILIO_MCP_URL = os.getenv("TWILIO_MCP_URL", "http://twilio_mcp:8050")

def resolve_params(params: dict, results: dict, user_id: str = None) -> dict:
    resolved = {}
    for key, value in params.items():
        if isinstance(value, str) and value in ("{user}", "{authenticated_user}"):
            # Skip resolving user_id field itself to avoid recursion
            if key == "user_id":
                resolved[key] = user_id
                continue
                
            # Fetch the authenticated user's GitHub username
            if not user_id:
                print(f"⚠️ No user_id provided to resolve {value}")
                resolved[key] = None
                continue
                
            try:
                user_response = httpx.post(f"{GITHUB_MCP_URL}/invoke/github.get_authenticated_user", 
                                        json={"user_id": user_id}, timeout=10)
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    if "result" in user_data and isinstance(user_data["result"], dict):
                        username = user_data["result"].get("login")
                        if username:
                            resolved[key] = username
                            print(f"✅ Resolved {value} to '{username}'")
                        else:
                            print(f"⚠️ No login field in user response: {user_data}")
                            resolved[key] = None
                    else:
                        print(f"⚠️ Unexpected user response format: {user_data}")
                        resolved[key] = None
                else:
                    print(f"⚠️ Failed to get authenticated user: HTTP {user_response.status_code}")
                    resolved[key] = None
            except Exception as e:
                print(f"⚠️ Error resolving {value}: {e}")
                resolved[key] = None
        elif (isinstance(value, str) and value.startswith("{") 
              and value.endswith("}")):
            ref = value[1:-1]
            parts = ref.split(".")
            
            if len(parts) == 2:
                # {node_2.message_id} format - explicit node reference
                node_id = parts[0]
                field = parts[1]
                node_result = results.get(node_id, {})
                if not node_result or not node_result.get("success"):
                    print(f"Cannot resolve {value} - node {node_id} not found or failed")
                    resolved[key] = None
                    continue
                result_data = node_result.get("result", {})
                actual_result = result_data.get("result", result_data) if isinstance(result_data, dict) else result_data
                resolved_value = actual_result.get(field) if isinstance(actual_result, dict) else None
                if resolved_value is None:
                    print(f"Field '{field}' not found in {node_id} result")
                    print(f"Available fields: {list(actual_result.keys()) if isinstance(actual_result, dict) else 'None'}")
                resolved[key] = resolved_value
            else:
                # {message_id} format - search ALL previous node results in order
                field = parts[0]
                resolved_value = None
                for prev_node_id, node_result in results.items():
                    if not node_result.get("success"):
                        continue
                    result_data = node_result.get("result", {})
                    actual_result = result_data.get("result", result_data) if isinstance(result_data, dict) else result_data
                    if isinstance(actual_result, dict) and field in actual_result:
                        resolved_value = actual_result[field]
                        print(f"Resolved {{{field}}} from {prev_node_id}: {resolved_value}")
                        break
                if resolved_value is None:
                    print(f"Cannot resolve {{{field}}} - field not found in any previous node result")
                resolved[key] = resolved_value
        elif isinstance(value, list):
            resolved_list = []
            for item in value:
                if isinstance(item, str) and item.startswith("{") and item.endswith("}"):
                    ref = item[1:-1]
                    parts = ref.split(".")
                    if len(parts) == 2:
                        node_id = parts[0]
                        field = parts[1]
                        node_result = results.get(node_id, {})
                        result_data = node_result.get("result", {}) if node_result.get("success") else {}
                        actual_result = result_data.get("result", result_data) if isinstance(result_data, dict) else result_data
                        resolved_list.append(actual_result.get(field) if isinstance(actual_result, dict) else None)
                    else:
                        field = parts[0]
                        found = None
                        for prev_node_id, node_result in results.items():
                            if not node_result.get("success"):
                                continue
                            result_data = node_result.get("result", {})
                            actual_result = result_data.get("result", result_data) if isinstance(result_data, dict) else result_data
                            if isinstance(actual_result, dict) and field in actual_result:
                                found = actual_result[field]
                                print(f"Resolved [{{{field}}}] from {prev_node_id}: {found}")
                                break
                        resolved_list.append(found)
                else:
                    resolved_list.append(item)
            resolved[key] = resolved_list
        else:
            resolved[key] = value
    return resolved

def call_tool(tool_name: str, params: dict) -> dict:
    # Determine which MCP service to use based on tool name
    if tool_name.startswith("github."):
        endpoint = tool_name  # Keep the full name like "github.create_repo"
        url = f"{GITHUB_MCP_URL}/invoke/{endpoint}"
    elif tool_name.startswith("google."):
        endpoint = tool_name  # Keep the full name like "google.gmail_send"
        url = f"{GOOGLE_MCP_URL}/invoke/{endpoint}"
    elif tool_name.startswith("discord."):
        endpoint = tool_name  # Keep the full name like "discord.send_message"
        url = f"{DISCORD_MCP_URL}/invoke/{endpoint}"
    elif tool_name.startswith("twilio."):
        endpoint = tool_name  # Keep the full name like "twilio.make_call"
        url = f"{TWILIO_MCP_URL}/invoke/{endpoint}"
    else:
        return { "success": False, "error": f"Unknown tool prefix: {tool_name}" }
    
    # Validate required fields are not None
    required_fields = {
        # GitHub tools
        "github.create_repo": ["name"],
        "github.create_or_update_file": ["owner", "repo", "file_path", "content", "message"],
        "github.get_repo": ["owner", "repo"],
        "github.delete_repo": ["owner", "repo"],
        "github.list_files": ["owner", "repo"],
        "github.get_file": ["owner", "repo", "file_path"],
        "github.delete_file": ["owner", "repo", "file_path", "message"],
        "github.create_issue": ["owner", "repo", "title"],
        "github.list_issues": ["owner", "repo"],
        "github.close_issue": ["owner", "repo", "issue_number"],
        "github.create_pull_request": ["owner", "repo", "title", "head", "base"],
        "github.merge_pull_request": ["owner", "repo", "pr_number"],
        "github.create_branch": ["owner", "repo", "branch_name"],
        "github.list_branches": ["owner", "repo"],
        "github.get_commits": ["owner", "repo"],
        "github.fork_repo": ["owner", "repo"],
        
        # Google Gmail tools
        "google.gmail_send": ["to", "subject", "body"],
        "google.gmail_get": ["message_id"],
        "google.gmail_reply": ["message_id", "body"],
        "google.gmail_search": ["query"],
        "google.gmail_apply_label": ["message_id", "label_ids"],
        "google.gmail_remove_label": ["message_id", "label_ids"],
        "google.gmail_label_messages": ["query", "label_id"],
        "google.gmail_get_or_create_label": ["name"],
        "google.gmail_create_label": ["name"],
        
        # Google Sheets tools
        "google.sheets_create": ["title"],
        "google.sheets_get": ["spreadsheet_id"],
        "google.sheets_read": ["spreadsheet_id", "range"],
        "google.sheets_write": ["spreadsheet_id", "range", "values"],
        "google.sheets_append": ["spreadsheet_id", "range", "values"],
        "google.sheets_clear": ["spreadsheet_id", "range"],
        "google.sheets_add_sheet": ["spreadsheet_id", "sheet_name"],
        "google.sheets_delete_rows": ["spreadsheet_id", "sheet_id", "start_index", "end_index"],
        
        # Discord tools
        "discord.send_message": ["channel_id", "content"],
        "discord.get_messages": ["channel_id"],
        "discord.send_dm": ["discord_user_id", "content"],
        "discord.list_channels": ["guild_id"],
        "discord.get_server_info": ["guild_id"],
        "discord.add_reaction": ["channel_id", "message_id", "emoji"],
        "discord.create_channel": ["guild_id", "name"],
        "discord.get_user": ["discord_user_id"],
        "discord.delete_message": ["channel_id", "message_id"],
        "discord.list_servers": [],
        
        # Twilio tools
        "twilio.make_call": ["message"],
        "twilio.send_sms": ["message"],
        "twilio.get_call_status": ["call_sid"],
        "twilio.get_sms_status": ["message_sid"],
        "twilio.send_whatsapp": ["message"]
    }
    
    missing_fields = []
    if endpoint in required_fields:
        for field in required_fields[endpoint]:
            if field not in params or params[field] is None:
                missing_fields.append(field)
    
    if missing_fields:
        error_msg = f"Missing required fields: {missing_fields}"
        print(f"❌ Validation failed: {error_msg}")
        return { "success": False, "error": error_msg }
    
    print(f"🔧 Calling: {url}")
    print(f"📦 Params: {params}")
    try:
        response = httpx.post(url, json=params, timeout=30)
        
        # Check HTTP status code
        if response.status_code == 404:
            print(f"❌ 404 Not Found: {url}")
            return { "success": False, "error": f"Tool endpoint not found: {url}" }
        
        if response.status_code != 200:
            print(f"❌ HTTP {response.status_code}: {url}")
            error_detail = ""
            try:
                error_data = response.json()
                error_detail = f" - {error_data.get('detail', '')}"
            except:
                pass
            return { "success": False, "error": f"HTTP {response.status_code}{error_detail}" }
        
        data = response.json()
        
        # Check if response itself contains an error
        if isinstance(data, dict) and "detail" in data:
            print(f"❌ API error: {data['detail']}")
            return { "success": False, "error": data["detail"] }
        
        # Check if result has error field
        if isinstance(data, dict) and data.get("error"):
            print(f"❌ Tool error: {data['error']}")
            return { "success": False, "error": data["error"] }
        
        print(f"✅ Response: {str(data)[:300]}")
        return { "success": True, "result": data }
        
    except Exception as e:
        print(f"❌ Exception: {e}")
        return { "success": False, "error": str(e) }

def topological_sort(nodes: list) -> list:
    ordered = []
    remaining = list(nodes)
    done = set()
    max_attempts = len(nodes) * 3
    attempts = 0
    while remaining and attempts < max_attempts:
        attempts += 1
        for node in remaining:
            deps = node.get("data", {}).get("depends_on", []) or []
            if all(d in done for d in deps):
                ordered.append(node)
                done.add(node["id"])
                remaining.remove(node)
                break
    ordered.extend(remaining)
    return ordered

def execute_dag(nodes: list, user_id: str) -> list:
    results = {}
    execution_log = []

    for node in topological_sort(nodes):
        node_id = node["id"]
        data = node.get("data", {})
        tool_name = data.get("tool")
        params = dict(data.get("params", {}))

        if not tool_name:
            print(f"⚠️ Skipping node {node_id} — no tool defined")
            continue

        params["user_id"] = user_id
        params = resolve_params(params, results, user_id)

        print(f"\n🚀 Executing node '{node_id}': {tool_name}")
        result = call_tool(tool_name, params)
        results[node_id] = result

        execution_log.append({
            "node_id": node_id,
            "tool": tool_name,
            "params": params,
            "result": result.get("result"),
            "success": result.get("success"),
            "error": result.get("error"),
            "executed_at": datetime.now(timezone.utc).isoformat()
        })

    return execution_log
