from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import httpx
import base64
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB setup
mongo_client = MongoClient(os.environ["MONGODB_URI"])
db = mongo_client[os.getenv("MONGODB_DB", "nexflow")]
integrations_col = db["integrations"]

def get_github_token(user_id: str) -> str:
    doc = integrations_col.find_one({ "user_id": user_id })
    if not doc:
        raise ValueError(f"No integration found for user_id: {user_id}")
    providers = doc.get("providers", [])
    github = next((p for p in providers if p["provider"] == "github"), None)
    if not github:
        raise ValueError(f"No GitHub provider for user_id: {user_id}")
    token = github["credentials"].get("access_token")
    if not token:
        raise ValueError(f"No GitHub access_token for user_id: {user_id}")
    return token

app = FastAPI()

# GitHub API setup
GITHUB_API_BASE = "https://api.github.com"
GITHUB_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

def get_github_token(user_id: str) -> str:
    doc = integrations_col.find_one({ "user_id": user_id })
    if not doc:
        raise ValueError(f"No integration found for user_id: {user_id}")
    providers = doc.get("providers", [])
    github = next((p for p in providers if p["provider"] == "github"), None)
    if not github:
        raise ValueError(f"No GitHub provider for user_id: {user_id}")
    token = github["credentials"].get("access_token")
    if not token:
        raise ValueError(f"No GitHub access_token for user_id: {user_id}")
    return token

def make_github_request(user_id: str, method: str, endpoint: str, **kwargs):
    """Make authenticated GitHub API request."""
    token = get_github_token(user_id)
    headers = {
        **GITHUB_HEADERS,
        "Authorization": f"Bearer {token}",
        **kwargs.pop("headers", {})
    }
    
    with httpx.Client() as client:
        response = client.request(method, f"{GITHUB_API_BASE}/{endpoint}", headers=headers, **kwargs)
        
        if response.status_code >= 400:
            error_msg = f"GitHub API error {response.status_code}"
            if response.status_code == 401:
                error_msg = "GitHub authentication failed"
            elif response.status_code == 403:
                error_msg = "GitHub permission denied"
            elif response.status_code == 404:
                error_msg = "GitHub resource not found"
            raise HTTPException(status_code=response.status_code, detail=error_msg)
        
        # Handle 204 No Content responses (e.g., successful repo deletion)
        if response.status_code == 204:
            return {"success": True, "message": "Operation successful"}
        
        return response.json()

# Request models
class BaseRequest(BaseModel):
    user_id: str

class AuthenticatedUserRequest(BaseRequest):
    pass

class ListReposRequest(BaseRequest):
    pass

class GetRepoRequest(BaseRequest):
    owner: str
    repo: str

class CreateRepoRequest(BaseRequest):
    name: str
    description: str = ""
    private: bool = True

class UpdateRepoRequest(BaseRequest):
    owner: str
    repo: str
    private: Optional[bool] = None       # True = make private, False = make public
    description: Optional[str] = None

class DeleteRepoRequest(BaseRequest):
    owner: str
    repo: str

class SearchReposRequest(BaseRequest):
    query: str

class ResolveRepoRequest(BaseRequest):
    query: str

class ListFilesRequest(BaseRequest):
    owner: str
    repo: str
    path: str = ""
    branch: str = "main"

class GetFileRequest(BaseRequest):
    owner: str
    repo: str
    file_path: str
    branch: str = "main"

class CreateOrUpdateFileRequest(BaseRequest):
    owner: str
    repo: str
    file_path: str
    content: str
    message: str
    branch: str = "main"
    sha: Optional[str] = None

class DeleteFileRequest(BaseRequest):
    owner: str
    repo: str
    file_path: str
    message: str
    branch: str = "main"

class GetCommitsRequest(BaseRequest):
    owner: str
    repo: str
    branch: str = "main"

class ListBranchesRequest(BaseRequest):
    owner: str
    repo: str

class CreateBranchRequest(BaseRequest):
    owner: str
    repo: str
    branch_name: str
    from_branch: str = "main"

class ForkRepoRequest(BaseRequest):
    owner: str
    repo: str

class CreateIssueRequest(BaseRequest):
    owner: str
    repo: str
    title: str
    body: str = ""
    labels: List[str] = []

class ListIssuesRequest(BaseRequest):
    owner: str
    repo: str
    state: str = "open"

class CloseIssueRequest(BaseRequest):
    owner: str
    repo: str
    issue_number: int

class CreatePullRequestRequest(BaseRequest):
    owner: str
    repo: str
    title: str
    head: str
    base: str
    body: str = ""

class MergePullRequestRequest(BaseRequest):
    owner: str
    repo: str
    pr_number: int
    merge_method: str = "squash"

# Tools endpoint
@app.get("/tools")
def tools():
    return [
        {
            "name": "github.get_authenticated_user",
            "description": "Get the authenticated GitHub user profile",
            "input_schema": AuthenticatedUserRequest.model_json_schema()
        },
        {
            "name": "github.list_repos",
            "description": "List repositories for the authenticated user",
            "input_schema": ListReposRequest.model_json_schema()
        },
        {
            "name": "github.get_repo",
            "description": "Get detailed repository information",
            "input_schema": GetRepoRequest.model_json_schema()
        },
        {
            "name": "github.create_repo",
            "description": "Create a new repository",
            "input_schema": CreateRepoRequest.model_json_schema()
        },
        {
            "name": "github.update_repo",
            "description": "Change an existing repository's visibility (private/public) and/or description",
            "input_schema": UpdateRepoRequest.model_json_schema()
        },
        {
            "name": "github.delete_repo",
            "description": "Delete a repository",
            "input_schema": DeleteRepoRequest.model_json_schema()
        },
        {
            "name": "github.search_repos",
            "description": "Search GitHub repositories",
            "input_schema": SearchReposRequest.model_json_schema()
        },
        {
            "name": "github.resolve_repo",
            "description": "Resolve repository by name/description matching",
            "input_schema": ResolveRepoRequest.model_json_schema()
        },
        {
            "name": "github.list_files",
            "description": "List files in a repository directory",
            "input_schema": ListFilesRequest.model_json_schema()
        },
        {
            "name": "github.get_file",
            "description": "Get file content from repository",
            "input_schema": GetFileRequest.model_json_schema()
        },
        {
            "name": "github.create_or_update_file",
            "description": "Create or update a file in repository",
            "input_schema": CreateOrUpdateFileRequest.model_json_schema()
        },
        {
            "name": "github.delete_file",
            "description": "Delete a file from repository",
            "input_schema": DeleteFileRequest.model_json_schema()
        },
        {
            "name": "github.get_commits",
            "description": "Get commit history for repository",
            "input_schema": GetCommitsRequest.model_json_schema()
        },
        {
            "name": "github.list_branches",
            "description": "List branches in repository",
            "input_schema": ListBranchesRequest.model_json_schema()
        },
        {
            "name": "github.create_branch",
            "description": "Create a new branch",
            "input_schema": CreateBranchRequest.model_json_schema()
        },
        {
            "name": "github.fork_repo",
            "description": "Fork a repository",
            "input_schema": ForkRepoRequest.model_json_schema()
        },
        {
            "name": "github.create_issue",
            "description": "Create an issue in repository",
            "input_schema": CreateIssueRequest.model_json_schema()
        },
        {
            "name": "github.list_issues",
            "description": "List issues in repository",
            "input_schema": ListIssuesRequest.model_json_schema()
        },
        {
            "name": "github.close_issue",
            "description": "Close an issue in repository",
            "input_schema": CloseIssueRequest.model_json_schema()
        },
        {
            "name": "github.create_pull_request",
            "description": "Create a pull request",
            "input_schema": CreatePullRequestRequest.model_json_schema()
        },
        {
            "name": "github.merge_pull_request",
            "description": "Merge a pull request",
            "input_schema": MergePullRequestRequest.model_json_schema()
        }
    ]

# Tool invoke endpoints
@app.post("/invoke/github.get_authenticated_user")
def get_authenticated_user(req: AuthenticatedUserRequest):
    try:
        data = make_github_request(req.user_id, "GET", "user")
        return {"result": {
            "login": data["login"],
            "name": data.get("name"),
            "email": data.get("email"),
            "public_repos": data["public_repos"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.list_repos")
def list_repos(req: ListReposRequest):
    try:
        data = make_github_request(req.user_id, "GET", "user/repos", params={"sort": "updated", "per_page": 30})
        return {"result": [
            {
                "name": repo["name"],
                "description": repo.get("description"),
                "private": repo["private"],
                "language": repo.get("language"),
                "updated_at": repo["updated_at"]
            }
            for repo in data
        ]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.get_repo")
def get_repo(req: GetRepoRequest):
    try:
        data = make_github_request(req.user_id, "GET", f"repos/{req.owner}/{req.repo}")
        return {"result": data}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.create_repo")
def create_repo(req: CreateRepoRequest):
    try:
        payload = {
            "name": req.name,
            "description": req.description,
            "private": req.private
        }
        data = make_github_request(req.user_id, "POST", "user/repos", json=payload)
        return {"result": {
            "name": data["name"],
            "html_url": data["html_url"],
            "clone_url": data["clone_url"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.update_repo")
def update_repo(req: UpdateRepoRequest):
    """PATCH /repos/{owner}/{repo}. Only the fields that were provided are changed."""
    payload = {}
    if req.private is not None:
        payload["private"] = req.private
    if req.description is not None:
        payload["description"] = req.description
    if not payload:
        return {"error": "Nothing to update: provide 'private' and/or 'description'."}
    try:
        data = make_github_request(req.user_id, "PATCH", f"repos/{req.owner}/{req.repo}", json=payload)
        return {"result": {
            "name": data["name"],
            "full_name": data["full_name"],
            "private": data["private"],
            "visibility": data.get("visibility"),
            "description": data.get("description"),
            "html_url": data["html_url"],
        }}
    except HTTPException as e:
        if e.status_code == 404:
            return {"error": f"Repository {req.owner}/{req.repo} not found (or your token can't access it)."}
        if e.status_code == 403:
            return {"error": "GitHub refused: the token needs the 'repo' scope (and admin rights on this repository)."}
        return {"error": str(e.detail)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.delete_repo")
def delete_repo(req: DeleteRepoRequest):
    try:
        token = get_github_token(req.user_id)
        headers = {
            **GITHUB_HEADERS,
            "Authorization": f"Bearer {token}",
        }
        
        with httpx.Client() as client:
            response = client.request("DELETE", f"{GITHUB_API_BASE}/repos/{req.owner}/{req.repo}", headers=headers)
            
            if response.status_code == 204:
                return {"success": True, "message": "Repository deleted successfully"}
            elif response.status_code == 403:
                return {"error": "Insufficient permissions. Ensure delete_repo scope is granted."}
            elif response.status_code == 404:
                return {"error": "Repository not found or already deleted."}
            elif response.status_code >= 400:
                error_msg = f"GitHub API error {response.status_code}"
                if response.status_code == 401:
                    error_msg = "GitHub authentication failed"
                raise HTTPException(status_code=response.status_code, detail=error_msg)
            else:
                return response.json()
                
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.search_repos")
def search_repos(req: SearchReposRequest):
    try:
        data = make_github_request(req.user_id, "GET", "search/repositories", params={"q": req.query, "per_page": 10})
        return {"result": [
            {
                "name": item["name"],
                "owner": item["owner"]["login"],
                "stars": item["stargazers_count"],
                "description": item.get("description")
            }
            for item in data["items"]
        ]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.resolve_repo")
def resolve_repo(req: ResolveRepoRequest):
    try:
        # Get all repos first
        repos_response = list_repos(ListReposRequest(user_id=req.user_id))
        if "error" in repos_response:
            return repos_response
        
        repos = repos_response["result"]
        query_tokens = req.query.lower().split()
        
        scored_repos = []
        for repo in repos:
            score = 0.0
            repo_name = repo["name"].lower()
            repo_desc = (repo.get("description") or "").lower()
            
            # Exact name match
            if req.query.lower() == repo_name:
                score = 1.0
            else:
                # Partial name match
                name_matches = sum(1 for token in query_tokens if token in repo_name)
                if name_matches > 0:
                    score = 0.7 * (name_matches / len(query_tokens))
                
                # Description match
                desc_matches = sum(1 for token in query_tokens if token in repo_desc)
                if desc_matches > 0:
                    score = max(score, 0.4 * (desc_matches / len(query_tokens)))
            
            if score > 0:
                scored_repos.append({"name": repo["name"], "score": score})
        
        # Sort and return top 3
        scored_repos.sort(key=lambda x: x["score"], reverse=True)
        return {"result": scored_repos[:3]}
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.list_files")
def list_files(req: ListFilesRequest):
    try:
        params = {"ref": req.branch}
        endpoint = f"repos/{req.owner}/{req.repo}/contents"
        if req.path:
            endpoint += f"/{req.path}"
        
        data = make_github_request(req.user_id, "GET", endpoint, params=params)
        return {"result": [
            {
                "name": item["name"],
                "type": item["type"],
                "size": item["size"],
                "path": item["path"]
            }
            for item in data
        ]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.get_file")
def get_file(req: GetFileRequest):
    try:
        params = {"ref": req.branch}
        data = make_github_request(req.user_id, "GET", f"repos/{req.owner}/{req.repo}/contents/{req.file_path}", params=params)
        
        content = ""
        if data.get("encoding") == "base64" and data.get("content"):
            content = base64.b64decode(data["content"]).decode("utf-8")
        
        return {"result": {
            "content": content,
            "sha": data["sha"],
            "size": data["size"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.create_or_update_file")
def create_or_update_file(req: CreateOrUpdateFileRequest):
    try:
        encoded_content = base64.b64encode(req.content.encode("utf-8")).decode("utf-8")
        
        payload = {
            "message": req.message,
            "content": encoded_content,
            "branch": req.branch
        }
        
        if req.sha:
            payload["sha"] = req.sha
        
        data = make_github_request(req.user_id, "PUT", f"repos/{req.owner}/{req.repo}/contents/{req.file_path}", json=payload)
        action = "updated" if req.sha else "created"
        
        return {"result": {
            "action": action,
            "commit_sha": data["commit"]["sha"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.delete_file")
def delete_file(req: DeleteFileRequest):
    try:
        # Get file SHA first
        file_response = get_file(GetFileRequest(user_id=req.user_id, owner=req.owner, repo=req.repo, file_path=req.file_path, branch=req.branch))
        if "error" in file_response:
            return file_response
        
        file_sha = file_response["result"]["sha"]
        
        payload = {
            "message": req.message,
            "sha": file_sha,
            "branch": req.branch
        }
        
        data = make_github_request(req.user_id, "DELETE", f"repos/{req.owner}/{req.repo}/contents/{req.file_path}", json=payload)
        return {"result": {
            "deleted": True,
            "commit_sha": data["commit"]["sha"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.get_commits")
def get_commits(req: GetCommitsRequest):
    try:
        params = {"sha": req.branch, "per_page": 20}
        data = make_github_request(req.user_id, "GET", f"repos/{req.owner}/{req.repo}/commits", params=params)
        return {"result": [
            {
                "sha": commit["sha"],
                "message": commit["commit"]["message"],
                "author": commit["commit"]["author"]["name"],
                "date": commit["commit"]["author"]["date"]
            }
            for commit in data
        ]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.list_branches")
def list_branches(req: ListBranchesRequest):
    try:
        data = make_github_request(req.user_id, "GET", f"repos/{req.owner}/{req.repo}/branches")
        return {"result": [
            {
                "name": branch["name"],
                "sha": branch["commit"]["sha"]
            }
            for branch in data
        ]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.create_branch")
def create_branch(req: CreateBranchRequest):
    try:
        # Get source branch SHA
        ref_data = make_github_request(req.user_id, "GET", f"repos/{req.owner}/{req.repo}/git/ref/heads/{req.from_branch}")
        source_sha = ref_data["object"]["sha"]
        
        # Create new branch
        payload = {
            "ref": f"refs/heads/{req.branch_name}",
            "sha": source_sha
        }
        
        make_github_request(req.user_id, "POST", f"repos/{req.owner}/{req.repo}/git/refs", json=payload)
        return {"result": {
            "branch_name": req.branch_name,
            "sha": source_sha
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.fork_repo")
def fork_repo(req: ForkRepoRequest):
    try:
        data = make_github_request(req.user_id, "POST", f"repos/{req.owner}/{req.repo}/forks")
        return {"result": {
            "full_name": data["full_name"],
            "clone_url": data["clone_url"],
            "html_url": data["html_url"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.create_issue")
def create_issue(req: CreateIssueRequest):
    try:
        payload = {
            "title": req.title,
            "body": req.body,
            "labels": req.labels
        }
        
        data = make_github_request(req.user_id, "POST", f"repos/{req.owner}/{req.repo}/issues", json=payload)
        return {"result": {
            "issue_number": data["number"],
            "url": data["html_url"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.list_issues")
def list_issues(req: ListIssuesRequest):
    try:
        params = {"state": req.state, "per_page": 20}
        data = make_github_request(req.user_id, "GET", f"repos/{req.owner}/{req.repo}/issues", params=params)
        return {"result": [
            {
                "number": issue["number"],
                "title": issue["title"],
                "state": issue["state"],
                "created_at": issue["created_at"]
            }
            for issue in data
        ]}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.close_issue")
def close_issue(req: CloseIssueRequest):
    try:
        payload = {"state": "closed"}
        data = make_github_request(req.user_id, "PATCH", f"repos/{req.owner}/{req.repo}/issues/{req.issue_number}", json=payload)
        return {"result": {
            "issue_number": data["number"],
            "state": "closed"
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.create_pull_request")
def create_pull_request(req: CreatePullRequestRequest):
    try:
        payload = {
            "title": req.title,
            "head": req.head,
            "base": req.base,
            "body": req.body
        }
        
        data = make_github_request(req.user_id, "POST", f"repos/{req.owner}/{req.repo}/pulls", json=payload)
        return {"result": {
            "pr_number": data["number"],
            "url": data["html_url"],
            "state": data["state"]
        }}
    except Exception as e:
        return {"error": str(e)}

@app.post("/invoke/github.merge_pull_request")
def merge_pull_request(req: MergePullRequestRequest):
    try:
        payload = {"merge_method": req.merge_method}
        data = make_github_request(req.user_id, "PUT", f"repos/{req.owner}/{req.repo}/pulls/{req.pr_number}/merge", json=payload)
        return {"result": {
            "merged": True,
            "sha": data["sha"]
        }}
    except Exception as e:
        return {"error": str(e)}
