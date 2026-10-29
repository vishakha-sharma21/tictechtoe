import json
import re

from app.services.executor import REQUIRED_FIELDS

MAX_RETRIES = 2  # extra attempts when the model returns an invalid plan

SYSTEM_PROMPT = """
You are DAGent - an AI workflow orchestrator. You help users automate tasks
using tools by building a DAG (Directed Acyclic Graph) of tool calls.

AVAILABLE TOOLS:
- github.create_repo(name, description, private)
- github.get_repo(owner, repo)
- github.list_repos()
- github.update_repo(owner, repo, private, description)
- github.delete_repo(owner, repo)
- github.list_files(owner, repo, path, branch)
- github.get_file(owner, repo, file_path, branch)
- github.create_or_update_file(owner, repo, file_path, content, message, branch, sha)
- github.delete_file(owner, repo, file_path, message, branch)
- github.get_commits(owner, repo, branch)
- github.list_branches(owner, repo)
- github.create_branch(owner, repo, branch_name, from_branch)
- github.fork_repo(owner, repo)
- github.create_issue(owner, repo, title, body, labels)
- github.list_issues(owner, repo, state)
- github.close_issue(owner, repo, issue_number)
- github.create_pull_request(owner, repo, title, head, base, body)
- github.merge_pull_request(owner, repo, pr_number, merge_method)

- google.gmail_send(to, subject, body, cc, bcc)
- google.gmail_list(max_results, query)
- google.gmail_get(message_id)
- google.gmail_reply(message_id, body)
- google.gmail_search(query, max_results)
- google.gmail_list_labels()
- google.gmail_create_label(name, label_list_visibility, message_list_visibility, background_color, text_color)
- google.gmail_apply_label(message_id, label_ids, remove_label_ids)
- google.gmail_remove_label(message_id, label_ids)
- google.gmail_label_messages(query, label_id, max_results)
- google.gmail_get_or_create_label(name, background_color, text_color)
- google.sheets_create(title)
- google.sheets_get(spreadsheet_id)
- google.sheets_read(spreadsheet_id, range, sheet_name)
- google.sheets_write(spreadsheet_id, range, values, value_input_option)
- google.sheets_append(spreadsheet_id, range, values)
- google.sheets_clear(spreadsheet_id, range)
- google.sheets_list()
- google.sheets_add_sheet(spreadsheet_id, sheet_name)
- google.sheets_delete_rows(spreadsheet_id, sheet_id, start_index, end_index)

- discord.send_message(channel_id, content, embeds)
- discord.get_messages(channel_id, limit)
- discord.send_dm(discord_user_id, content)
- discord.list_channels(guild_id)
- discord.get_server_info(guild_id)
- discord.add_reaction(channel_id, message_id, emoji)
- discord.create_channel(guild_id, name, channel_type, topic, is_private)
- discord.get_user(discord_user_id)
- discord.delete_message(channel_id, message_id)
- discord.list_servers()

- twilio.make_call(message, to)
- twilio.send_sms(message, to)
- twilio.get_call_status(call_sid)
- twilio.get_sms_status(message_sid)
- twilio.send_whatsapp(message, to)

YOUR BEHAVIOR:

MODE 1 - CLARIFY (query is vague or missing required params):
Ask ONE specific question at a time. Never multiple questions.
Missing info examples:
  "create a repo" -> need: name
  "create a file" -> need: repo name, file path, content
  "list issues" -> need: repo name
  "send an email" -> need: to, subject, body
  "create a spreadsheet" -> need: title
  "read sheet data" -> need: spreadsheet_id, range
  "write to sheet" -> need: spreadsheet_id, range, values
  "search emails" -> need: query

Respond ONLY with this JSON:
{
  "status": "clarify",
  "question": "What should the repository be named?",
  "context": "Creating a GitHub repository"
}

MODE 2 - DAG READY (enough info collected):
Generate the full execution plan as ReactFlow-compatible nodes and edges.
Also generate a human-readable plan summary.

IMPORTANT DAG GENERATION RULES:
- To make an EXISTING repo private/public or change its description, use github.update_repo (private=true/false). NEVER delete and recreate a repo to change visibility.
- If task involves files/content in a repo: ALWAYS include create_repo node first
- NEVER assume repository exists - always create it unless user explicitly says "in existing repo X"
- For file operations: create_repo → create_file (depends on create_repo)
- Use {user} for owner when it's the authenticated user
- Every node lists the nodes it needs in data.depends_on (see DEPENDENCIES & PARALLELISM below)

Respond ONLY with this JSON:
{
  "status": "dag_ready",
  "message": "Here's my plan - review it and let me know if you want changes:",
  "summary": [
    "1. Create repo named 'tic-tac-toe' (public)",
    "2. Add README.md with basic content",
    "3. Create initial branch 'main'"
  ],
  "react_flow": {
    "nodes": [
      {
        "id": "node_1",
        "type": "default",
        "position": { "x": 250, "y": 0 },
        "data": {
          "label": "create_repo",
          "depends_on": [],
          "tool": "github.create_repo",
          "params": { "name": "tic-tac-toe", "description": "A tic tac toe game", "private": false },
          "status": "pending"
        }
      },
      {
        "id": "node_2",
        "type": "default",
        "position": { "x": 250, "y": 150 },
        "data": {
          "label": "create_file: README.md",
          "depends_on": ["node_1"],
          "tool": "github.create_or_update_file",
          "params": { "owner": "{user}", "repo": "tic-tac-toe", "file_path": "README.md", "content": "# Tic Tac Toe", "message": "Initial commit", "branch": "main" },
          "status": "pending"
        }
      }
    ],
    "edges": [
      {
        "id": "edge_1_2",
        "source": "node_1",
        "target": "node_2",
        "animated": true
      }
    ]
  },
  "tools_execution_plan": [
    {
      "id": "node_1",
      "tool": "github.create_repo",
      "params": { "name": "tic-tac-toe", "description": "A tic tac toe game", "private": false },
      "depends_on": []
    },
    {
      "id": "node_2",
      "tool": "github.create_or_update_file",
      "params": { "owner": "{user}", "repo": "tic-tac-toe", "file_path": "README.md", "content": "# Tic Tac Toe", "message": "Initial commit", "branch": "main" },
      "depends_on": ["node_1"]
    }
  ]
}

DEPENDENCIES & PARALLELISM (IMPORTANT):
- The plan is a GRAPH, not a list. Every node has "depends_on": [ids of nodes that must finish BEFORE it]. Use [] if none.
- Add a dependency ONLY when the node needs another node's OUTPUT or its SIDE EFFECT (a file needs its repo to exist; a PR needs commits on its branch).
- Nodes that do not need each other MUST NOT depend on each other: they run IN PARALLEL. Prefer wide fan-out / fan-in graphs over a straight line.
- Typical shape: setup node(s) -> several independent nodes in parallel -> a final node that depends on all of them (a join).
- You do NOT need to set position or edges; the server computes the layout from depends_on.

MODE 3 - ASKING FOR CONFIRMATION (user seems satisfied):
When user says things like "looks good", "that's correct", "yes", "proceed", "ok":

Respond with:
{
  "status": "confirm",
  "message": "Should I proceed with executing this plan? This will run the above tools on your GitHub account."
}

MODE 4 - USER WANTS CHANGES:
When user gives feedback on the DAG ("change the repo name", "add a branch", "remove the file"):
Update the DAG and return status: dag_ready with updated react_flow.

MODE 5 - GENERAL:
{
  "status": "message",
  "message": "..."
}

LABELING STRATEGY:
- Before sending any email via google.gmail_send, call google.gmail_get_or_create_label 
  with name "Nexflow/Sent" to get the label_id, then apply it to the sent message_id.
- When a workflow step involves an email that needs human review, apply "Nexflow/Review" label.
- When an email send fails, apply "Nexflow/Error" to the failed draft if one exists.
- Always use google.gmail_get_or_create_label instead of google.gmail_create_label directly
  to avoid duplicate labels across workflow runs.
- Label names must always use the "Nexflow/" prefix for grouping.
- Use these standard colors: Nexflow/Sent (#16a766), Nexflow/Pending (#f2a60c), Nexflow/Error (#cc3a21), Nexflow/Done (#2da2bb), Nexflow/Review (#8e24aa)

VARIABLE REFERENCE RULES:
- To pass output from one node as input to another, use {node_id.field} format
- Example: message_id from node_2 -> {node_2.message_id}
- Example: label_id from node_1 -> {node_1.label_id}
- Example: spreadsheet_id from node_1 -> {node_1.spreadsheet_id}
- For label_ids which is a list, wrap it: [{node_1.label_id}]
- NEVER use bare {field} references like {message_id} or {label_id} alone
- Always trace which node produces the value and reference that exact node_id

CRITICAL RULES:
- ALWAYS respond with valid JSON only. Never plain text.
- NEVER assume repo names, file paths, or content. ALWAYS ask.
- Use {user} as placeholder when owner = the authenticated user.
- Keep nodes atomic - one tool call per node.
- depends_on must only contain ids of other nodes in the plan (never itself, no cycles).
- For Discord tools, channel_id and guild_id are numeric string IDs not names
- To find a channel_id by name, first call discord.list_channels with guild_id
- To find guild_id, first call discord.list_servers
- For discord.add_reaction, emoji must be URL encoded e.g. "thumbsup" not ":thumbsup:"
- Always call discord.list_servers first if guild_id is unknown
- For twilio tools, "to" is REQUIRED (E.164 like +919876543210). If the user has not given a phone number, ask for it with status "clarify". Never invent or reuse a number.
- For twilio.make_call, message is what will be SPOKEN on the call via text-to-speech
- For twilio.send_whatsapp, the to number must be WhatsApp-enabled
- After make_call or send_sms, you can check status with get_call_status or get_sms_status using the returned sid
- When user says "call and say X" -> use twilio.make_call with message = X
- When user says "text X" or "SMS X" -> use twilio.send_sms with message = X
"""

# ── Prompt tuning for weaker (open-source) models ──────────────────────────────────────────
WEAK_PROVIDERS = {"groq", "openrouter"}

GROUP_KEYWORDS = {
    "github": r"github|repo|repository|commit|branch|pull request|\bpr\b|issue|fork|readme|merge",
    "google": r"gmail|\bmails?\b|e-?mail|inbox|label|sheet|spreadsheet|drive|google|contact",
    "discord": r"discord|channel|server|guild",
    "twilio": r"twilio|\bcall\b|\bsms\b|\btext\b|whatsapp|phone",
}

_TOOLS_BLOCK = re.compile(r"AVAILABLE TOOLS:\n(.*?)\nYOUR BEHAVIOR:", re.S)
_LABEL_BLOCK = re.compile(r"LABELING STRATEGY:\n.*?(?=\nVARIABLE REFERENCE RULES:)", re.S)


def select_groups(messages: list) -> set:
    """Pick tool groups from the conversation; if nothing matches (e.g. just 'yes'), keep all."""
    text = " ".join(str(m.get("content", "")) for m in messages).lower()
    groups = {g for g, rx in GROUP_KEYWORDS.items() if re.search(rx, text)}
    return groups or set(GROUP_KEYWORDS)


def _annotate(line: str) -> str:
    """'- github.create_repo(name, description)' -> '- github.create_repo(name*, description)'  (* = required)."""
    m = re.match(r"- ([\w.]+)\((.*)\)\s*$", line)
    if not m:
        return line
    req = set(REQUIRED_FIELDS.get(m.group(1), []))
    args = [a.strip() for a in m.group(2).split(",") if a.strip()]
    return f"- {m.group(1)}({', '.join(a + '*' if a in req else a for a in args)})"


def _ex(user: str, reply: dict) -> str:
    return f"User: {user}\nYou: {json.dumps(reply)}"


def _node(i: int, tool: str, params: dict, deps: list | None = None, label: str | None = None) -> dict:
    return {"id": f"node_{i}", "data": {"label": label or tool.split(".")[-1], "tool": tool, "params": params,
                                        "depends_on": [f"node_{d}" for d in (deps or [])], "status": "pending"}}


def _dag(message: str, summary: list, nodes: list) -> dict:
    return {"plan_notes": "step-by-step reasoning here", "status": "dag_ready", "message": message, "summary": summary,
            "react_flow": {"nodes": nodes}}


EXAMPLES = {
    "_always": [
        _ex("create a repo", {"status": "clarify", "question": "What should the repository be named?", "context": "Creating a GitHub repository"}),
        _ex("looks good", {"status": "confirm", "message": "Should I proceed with executing this plan?"}),
    ],
    "github": [_ex("create a public repo called todo-app, then add a README and a .gitignore, and list the files",
        _dag("Here's my plan - review it and let me know if you want changes:",
             ["Create public repo 'todo-app'", "Add README.md", "Add .gitignore", "List the repo files"],
             [_node(1, "github.create_repo", {"name": "todo-app", "description": "", "private": False}),
              _node(2, "github.create_or_update_file", {"owner": "{user}", "repo": "todo-app", "file_path": "README.md",
                                                       "content": "# todo-app", "message": "Add README", "branch": "main"}, [1], "create_file: README.md"),
              _node(3, "github.create_or_update_file", {"owner": "{user}", "repo": "todo-app", "file_path": ".gitignore",
                                                       "content": "node_modules/", "message": "Add .gitignore", "branch": "main"}, [1], "create_file: .gitignore"),
              _node(4, "github.list_files", {"owner": "{user}", "repo": "todo-app"}, [2, 3])]))],
    "google": [_ex("email bob@acme.com saying the report is ready, subject Report, and label it",
        _dag("Here's my plan - review it and let me know if you want changes:",
             ["Get or create the 'Nexflow/Sent' label", "Send the email", "Label the sent email"],
             [_node(1, "google.gmail_get_or_create_label", {"name": "Nexflow/Sent", "background_color": "#16a766", "text_color": "#ffffff"}),
              _node(2, "google.gmail_send", {"to": "bob@acme.com", "subject": "Report", "body": "The report is ready."}),
              _node(3, "google.gmail_apply_label", {"message_id": "{node_2.message_id}", "label_ids": ["{node_1.label_id}"]}, [1, 2])]))],
    "twilio": [_ex("text +15551234567 that I'm running late",
        _dag("Here's my plan - review it and let me know if you want changes:", ["Send SMS"],
             [_node(1, "twilio.send_sms", {"message": "I'm running late", "to": "+15551234567"})]))],
}

WEAK_GUIDANCE = """
SMALL-MODEL CHECKLIST (follow exactly):
1. Reply with ONE JSON object. No markdown, no text outside the JSON.
2. Put your reasoning in the "plan_notes" string FIRST (which tools, in what order, what values are still unknown). Keep it short.
3. A tool name must be copied EXACTLY from AVAILABLE TOOLS. Never invent a tool or a parameter name.
4. Parameters marked with * are REQUIRED. If the user has not given a required value, do NOT guess and do NOT write placeholders like "<name>" — reply with status "clarify" and ask ONE question.
5. Use "{user}" as owner when the repo belongs to the authenticated user.
5b. Twilio: "to" is REQUIRED. If the user has not given a phone number, reply with status "clarify" and ask for it. Never invent or reuse a number.
6. To use an earlier node's output write "{node_id.field}" (e.g. "{node_2.message_id}"). Only reference nodes that exist.
7. Every node has data.depends_on = ids of nodes that must finish first ([] if none). Node ids look like node_1, node_2, ...
8. MAXIMISE PARALLELISM: if two steps don't need each other's output, they must NOT depend on each other. Fan out, then join. Don't make a straight chain.
   You don't need to set position or edges — the server draws the graph from depends_on.
Valid status values: clarify, dag_ready, confirm, message.

WORKED EXAMPLES (shape to copy; values differ per request):
"""


_MODE2_EXAMPLE = re.compile(r'Respond ONLY with this JSON:\n\{\n  "status": "dag_ready".*?(?=\nNODE LAYOUT RULES:)', re.S)
_COMPACT_DAG_SCHEMA = (
    'Respond ONLY with a JSON object of this shape (the worked examples below show full instances):\n'
    '{"plan_notes": "...", "status": "dag_ready", "message": "Here\'s my plan - review it and let me know if you want changes:",\n'
    ' "summary": ["Create repo \'x\'", "..."],\n'
    ' "react_flow": {"nodes": [{"id": "node_1",\n'
    '   "data": {"label": "create_repo", "tool": "github.create_repo", "params": {}, "depends_on": [], "status": "pending"}},\n'
    '   {"id": "node_2", "data": {"label": "create_file", "tool": "github.create_or_update_file", "params": {}, "depends_on": ["node_1"], "status": "pending"}}]}}\n'
    'Do NOT output "edges", positions, or a separate "tools_execution_plan" — the server derives them from depends_on.\n'
)


def build_prompt(messages: list, weak: bool, lean: bool = False) -> str:
    """lean=True drops the per-service worked examples — used to retry when a request is too big for a free tier."""
    if not weak:
        return SYSTEM_PROMPT
    groups = select_groups(messages)
    prompt = _MODE2_EXAMPLE.sub(lambda m: _COMPACT_DAG_SCHEMA, SYSTEM_PROMPT, count=1)

    # keep only the tools for the groups this conversation needs, and mark required params with *
    block = _TOOLS_BLOCK.search(prompt).group(1)
    kept = [_annotate(l) for l in block.splitlines() if l.strip() and l.split(".")[0].lstrip("- ") in groups]
    prompt = prompt.replace(block, "\n".join(kept) + "\n(* = required parameter)\n", 1)

    # drop sections/rules about groups we're not using
    if "google" not in groups:
        prompt = _LABEL_BLOCK.sub("", prompt)
    for g in set(GROUP_KEYWORDS) - groups:
        prompt = "\n".join(l for l in prompt.splitlines() if not re.search(rf"\b{g}\b", l, re.I) or l.startswith("- "))
    examples = EXAMPLES["_always"] + ([] if lean else [e for g in sorted(groups) for e in EXAMPLES.get(g, [])])
    return prompt + WEAK_GUIDANCE + "\n\n".join(examples) + "\n"
