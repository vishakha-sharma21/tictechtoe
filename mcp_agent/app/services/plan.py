"""Validate / repair the orchestrator's JSON so weaker (open-source) models can't hand the executor garbage."""
import os
import re

from app.services.executor import REQUIRED_FIELDS

KNOWN_TOOLS = set(REQUIRED_FIELDS)
STATUSES = {"clarify", "dag_ready", "confirm", "message"}
_REF = re.compile(r"^\{.+\}$")
# Values a model invents instead of asking: "<repo-name>", "YOUR_TOKEN", "example@example.com", "...".
_PLACEHOLDER = re.compile(r"^<[^>]+>$|^\[[A-Z_ ]+\]$|\bYOUR_[A-Z_]+\b|^(?:\.\.\.|TBD|TODO|N/A)$|@example\.(?:com|org)$", re.I)


def _fix_phone(data: dict) -> None:
    """Twilio needs E.164 (+<country><number>). Add DEFAULT_PHONE_COUNTRY_CODE to bare national numbers."""
    params = data.get("params")
    if not (isinstance(params, dict) and str(data.get("tool", "")).startswith("twilio.") and isinstance(params.get("to"), str)):
        return
    digits = re.sub(r"[\s\-().]", "", params["to"])
    cc = os.getenv("DEFAULT_PHONE_COUNTRY_CODE", "").strip()
    if cc and re.fullmatch(r"0?\d{10}", digits):  # national format, optionally with a leading trunk 0
        digits = cc + digits[-10:]
    if re.fullmatch(r"\+?\d{8,15}", digits):
        params["to"] = digits if digits.startswith("+") else "+" + digits


_NODE_REF = re.compile(r"\{(node_[\w-]+)\.")
GITHUB_READS = {"github.list_files", "github.get_file", "github.get_commits", "github.list_branches", "github.list_issues",
                "github.get_repo", "github.list_repos"}
GITHUB_LISTINGS = {"github.list_files", "github.get_commits", "github.list_branches", "github.list_issues"}
GITHUB_FILE_WRITES = {"github.create_or_update_file", "github.delete_file"}


def _refs(value) -> set:
    """Node ids referenced as {node_x.field} inside any params value."""
    if isinstance(value, str):
        return set(_NODE_REF.findall(value))
    if isinstance(value, list):
        return set().union(*[_refs(v) for v in value]) if value else set()
    if isinstance(value, dict):
        return set().union(*[_refs(v) for v in value.values()]) if value else set()
    return set()


def _implicit_github_deps(nodes: list) -> dict:
    """Dependencies models forget but that are real: a file needs its repo, a PR needs its branch's commits, ..."""
    deps = {n["id"]: set() for n in nodes}
    for j, n in enumerate(nodes):
        d = n.get("data", {}); tool = d.get("tool", ""); p = d.get("params") or {}
        if not tool.startswith("github.") or tool == "github.create_repo":
            continue
        repo = p.get("repo")
        for i in range(j):
            e = nodes[i]; ed = e.get("data", {}); et = ed.get("tool", ""); ep = ed.get("params") or {}
            if not et.startswith("github."):
                continue
            same_repo = repo is not None and (ep.get("repo") == repo or (et == "github.create_repo" and ep.get("name") == repo))
            if not same_repo:
                continue
            if et == "github.create_repo":
                deps[n["id"]].add(e["id"])                                   # everything in a repo needs the repo
            elif et == "github.create_branch":
                branches = {p.get("branch"), p.get("head"), p.get("base")} - {None, "main", "master"}
                if ep.get("branch_name") in branches:
                    deps[n["id"]].add(e["id"])                               # work on a branch needs the branch
            elif et in GITHUB_FILE_WRITES:
                if tool == "github.create_pull_request" and ep.get("branch", "main") == p.get("head"):
                    deps[n["id"]].add(e["id"])                               # a PR needs commits on its head branch
                elif tool in ("github.get_file", "github.list_files") and ep.get("branch", "main") == p.get("branch", "main"):
                    deps[n["id"]].add(e["id"])                               # reading a file needs it written first
            if tool in GITHUB_LISTINGS and et not in GITHUB_READS:
                deps[n["id"]].add(e["id"])                                   # listings reflect every earlier change (fan-in)
            if tool == "github.merge_pull_request" and et == "github.create_pull_request":
                deps[n["id"]].add(e["id"])
            if tool == "github.close_issue" and et == "github.create_issue":
                deps[n["id"]].add(e["id"])
    return deps


def build_graph(flow: dict) -> None:
    """Derive edges, depends_on and a layered layout from node dependencies.

    Dependencies = what the model declared in data.depends_on + {node_x.field} references + real-world implicit ones.
    Edges the model drew are ignored on purpose (models draw straight lines). Independent nodes end up side by side.
    """
    nodes = [n for n in flow.get("nodes", []) if isinstance(n, dict) and isinstance(n.get("data"), dict)]
    ids = [n["id"] for n in nodes]; idx = {i: k for k, i in enumerate(ids)}
    implicit = _implicit_github_deps(nodes)
    deps = {}
    for n in nodes:
        declared = n["data"].get("depends_on") or []
        declared = {d for d in declared if isinstance(d, str)} if isinstance(declared, list) else set()
        d = (declared | _refs(n["data"].get("params")) | implicit[n["id"]]) & set(ids)
        d.discard(n["id"])
        deps[n["id"]] = d

    def acyclic(dd) -> bool:
        indeg = {i: len(dd[i]) for i in ids}; ready = [i for i in ids if not indeg[i]]; seen = 0
        while ready:
            x = ready.pop(); seen += 1
            for i in ids:
                if x in dd[i]:
                    indeg[i] -= 1
                    if not indeg[i]:
                        ready.append(i)
        return seen == len(ids)

    if not acyclic(deps):  # model produced a cycle: keep only dependencies pointing to earlier nodes
        deps = {i: {d for d in dd if idx[d] < idx[i]} for i, dd in deps.items()}

    # transitive reduction: drop A->C when A->B->C already exists (cleaner graph, same execution order)
    def ancestors(i, memo={}):
        out = set()
        for d in deps[i]:
            out |= {d} | ancestors(d)
        return out
    reduced = {i: {d for d in dd if not any(d in ancestors(o) for o in dd if o != d)} for i, dd in deps.items()}

    level = {}
    def lvl(i):
        if i not in level:
            level[i] = 0 if not reduced[i] else 1 + max(lvl(d) for d in reduced[i])
        return level[i]
    for i in ids:
        lvl(i)

    by_level: dict = {}
    for i in ids:
        by_level.setdefault(level[i], []).append(i)
    widest = max((len(v) for v in by_level.values()), default=1)
    step_x, step_y, center = 280, 150, 250 + (widest - 1) * 140
    pos = {}
    for lv, members in by_level.items():
        for k, i in enumerate(members):
            pos[i] = {"x": center + (k - (len(members) - 1) / 2) * step_x, "y": lv * step_y}

    for n in nodes:
        n["position"] = pos[n["id"]]
        n["data"]["depends_on"] = sorted(reduced[n["id"]], key=idx.get)
    flow["nodes"] = nodes
    flow["edges"] = [{"id": f"edge_{d}_{i}", "source": d, "target": i, "animated": True}
                     for i in ids for d in sorted(reduced[i], key=idx.get)]


def normalize_plan(result):
    """Cheap, safe auto-fixes for things models commonly get slightly wrong (no retry needed)."""
    if not isinstance(result, dict):
        return result
    st = result.get("status")
    if st == "dag_ready" and not str(result.get("message") or "").strip():
        result["message"] = "Here's my plan - review it and let me know if you want changes:"
    if st == "confirm" and not str(result.get("message") or "").strip():
        result["message"] = "Should I proceed with executing this plan?"
    result.pop("plan_notes", None)  # scratchpad field used to help small models reason; never shown
    if isinstance(result.get("summary"), list):  # the UI numbers the steps itself; models also add "1." -> "1. 1."
        result["summary"] = [re.sub(r"^\s*\d+[.)]\s*", "", x) if isinstance(x, str) else x for x in result["summary"]]
    flow = result.get("react_flow")
    if isinstance(flow, dict) and isinstance(flow.get("nodes"), list):
        for i, n in enumerate(flow["nodes"]):
            if not isinstance(n, dict):
                continue
            n.setdefault("type", "default")
            pos = n.get("position") if isinstance(n.get("position"), dict) else {}
            try:
                x, y = float(pos.get("x", 250)), float(pos.get("y", i * 150))
            except (TypeError, ValueError):
                x, y = 250.0, float(i * 150)
            n["position"] = {"x": x, "y": y}
            if isinstance(n.get("data"), dict):
                _fix_phone(n["data"])
                n["data"].setdefault("status", "pending")
                if isinstance(n["data"].get("tool"), str):
                    n["data"]["tool"] = n["data"]["tool"].strip()
                n["data"].setdefault("label", (n["data"].get("tool") or "").split(".")[-1])
        if all(isinstance(n, dict) and isinstance(n.get("id"), str) and isinstance(n.get("data"), dict) for n in flow["nodes"]):
            build_graph(flow)
    return result


def validate_plan(result) -> list[str]:
    """Returns human-readable problems; empty list = OK. The messages are fed back to the model on retry."""
    if not isinstance(result, dict):
        return ["Top-level reply must be a JSON object."]
    status = result.get("status")
    if status not in STATUSES:
        return [f'"status" must be one of {sorted(STATUSES)}, got {status!r}.']

    if status == "clarify":
        return [] if isinstance(result.get("question"), str) and result["question"].strip() else ['"clarify" needs a non-empty "question" string.']
    if status in ("confirm", "message"):
        return [] if isinstance(result.get("message"), str) and result["message"].strip() else [f'"{status}" needs a non-empty "message" string.']

    # dag_ready
    errors: list[str] = []
    flow = result.get("react_flow")
    nodes = flow.get("nodes") if isinstance(flow, dict) else None
    if not isinstance(nodes, list) or not nodes:
        return ['"dag_ready" needs react_flow.nodes as a non-empty list.']

    ids: set[str] = set()
    for n in nodes:
        nid = n.get("id") if isinstance(n, dict) else None
        if not isinstance(nid, str) or not nid:
            errors.append("Every node needs a string \"id\".")
            continue
        if nid in ids:
            errors.append(f'Duplicate node id "{nid}".')
        ids.add(nid)
        data = n.get("data") if isinstance(n.get("data"), dict) else {}
        tool = data.get("tool")
        if tool not in KNOWN_TOOLS:
            errors.append(f'Node "{nid}": unknown tool {tool!r}. Use ONLY tools from the AVAILABLE TOOLS list, written exactly like "github.create_repo".')
            continue
        params = data.get("params")
        if not isinstance(params, dict):
            errors.append(f'Node "{nid}": "params" must be an object.')
            continue
        for field in REQUIRED_FIELDS[tool]:
            v = params.get(field)
            if v is None or (isinstance(v, str) and not v.strip() and not _REF.match(v)):
                errors.append(f'Node "{nid}" ({tool}): missing required param "{field}".')
        for k, v in params.items():
            if isinstance(v, str) and _PLACEHOLDER.search(v.strip()):
                errors.append(f'Node "{nid}" ({tool}): param "{k}" is a placeholder ({v!r}). Never invent values — use status "clarify" to ask the user instead.')

    for e in (flow.get("edges") or []):
        if not isinstance(e, dict) or e.get("source") not in ids or e.get("target") not in ids:
            errors.append(f"Edge {e!r} must reference existing node ids.")
    return errors
