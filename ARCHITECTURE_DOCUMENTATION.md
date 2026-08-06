# DAGent - Complete Architecture Documentation

## Table of Contents
1. [High Level Design (HLD)](#hld)
2. [Low Level Design (LLD)](#lld)
3. [Database Design](#database-design)
4. [ER Diagram](#er-diagram)
5. [MCP Generation & Dockerization](#mcp-generation)
6. [AI Integration & Prompt Engineering]((#ai-integration))
7. [Scalability Architecture](#scalability)

---

## High Level Design (HLD)

### System Overview
DAGent is an AI-powered workflow orchestration platform that converts natural language queries into executable Directed Acyclic Graphs (DAGs) with parallel execution capabilities.

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Next.js    │  │  React Flow  │  │   Redux      │          │
│  │   Frontend   │  │  DAG Visual  │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              FastAPI Main Application (Port 8010)         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Query      │  │Orchestrator  │  │ Integration  │  │   │
│  │  │   Processing │  │   Service    │  │   Manager    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  GitHub MCP  │  │  Google MCP  │  │ Discord MCP  │          │
│  │   Port 8020  │  │   Port 8030  │  │   Port 8040  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │  Twilio MCP  │  │ Mult. MCP    │                          │
│  │   Port 8050  │  │   (Math)      │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   GitHub     │  │    Google    │  │   Discord    │          │
│  │     API      │  │   Workspace  │  │     API      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │   Twilio     │  │   OpenAI     │                          │
│  │     API      │  │   GPT-4o     │                          │
│  └──────────────┘  └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas (Database)                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │   Users  │  │Integratns│  │  Chats   │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. Frontend Layer (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux
- **Visualization**: React Flow for DAG rendering
- **UI Components**: Custom component library with design system

#### 2. Backend Layer (FastAPI)
- **Framework**: FastAPI (Python)
- **Main Service**: Port 8010
- **Responsibilities**: 
  - Query processing and validation
  - AI orchestration via OpenAI GPT-4o
  - DAG execution coordination
  - Integration management

#### 3. MCP Server Layer
Each MCP server is a独立的 FastAPI microservice:
- **GitHub MCP** (Port 8020): GitHub API operations
- **Google MCP** (Port 8030): Gmail, Sheets, Calendar operations
- **Discord MCP** (Port 8040): Discord messaging and server management
- **Twilio MCP** (Port 8050): SMS, calls, WhatsApp messaging
- **Multiplication MCP**: Math and computation utilities

#### 4. Data Layer
- **Database**: MongoDB Atlas
- **Collections**: users, integrations, chats
- **Authentication**: NextAuth.js with MongoDB adapter

### Technology Stack Summary
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14, React, TypeScript | UI framework |
| Styling | Tailwind CSS | Utility-first CSS |
| State | Redux | Client state management |
| Visualization | React Flow | DAG rendering |
| Backend API | FastAPI | REST API server |
| AI/ML | OpenAI GPT-4o | Natural language processing |
| Database | MongoDB Atlas | Data persistence |
| Auth | NextAuth.js | Authentication |
| Containerization | Docker | Service isolation |
| Orchestration | Docker Compose | Multi-container management |

---

## Low Level Design (LLD)

### Component Breakdown

#### 1. Frontend Components

##### Directory Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── auth/page.tsx      # Authentication
│   └── dashboard/page.tsx # Main application
├── components/
│   ├── shared/           # Design system atoms
│   ├── landing/          # Marketing components
│   └── dashboard/        # Core application components
├── lib/                  # Utilities and helpers
├── store/                # Redux stores
├── types/                # TypeScript definitions
└── hooks/                # Custom React hooks
```

##### Key Components

**Dashboard Components**
- `IconRail.tsx`: Vertical navigation rail (52px width)
- `Sidebar.tsx`: Workflow history panel (260px width)
- `ChatPanel.tsx`: Conversation interface (420px width)
- `CanvasPanel.tsx`: DAG visualization and log viewer (flex width)
- `WorkflowCard.tsx`: Embedded workflow status in chat
- `DagNodeCard.tsx`: Individual DAG node UI
- `ParallelBlock.tsx`: Parallel branch visualization
- `LogViewer.tsx`: Color-coded log table

##### State Management (Redux)
```typescript
// Workflow state structure
interface WorkflowState {
  currentWorkflow: Workflow | null;
  chatHistory: ChatMessage[];
  executionLog: ExecutionLog[];
  reactFlow: ReactFlowData;
  isExecuting: boolean;
}
```

#### 2. Backend API Structure

##### Main Application (`mcp_agent/app/main.py`)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import query, integrations

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

 # Route registration
app.include_router(query.router)
app.include_router(integrations.router)
```

##### API Routes

**Query Routes** (`app/routes/query.py`)
- `POST /process-query`: Analyze query and detect required tools
- `POST /orchestrate`: Generate DAG from natural language
- `POST /execute-dag`: Execute the generated DAG

**Integration Routes** (`app/routes/integrations.py`)
- `POST /integrations/init`: Initialize user integration document
- `POST /integrations/upsert`: Add/update provider credentials
- `POST /integrations/upsert-by-email`: Upsert by email lookup
- `POST /integrations/check`: Check integration status

##### Service Layer

**Orchestrator Service** (`app/services/orchestrator.py`)
- Uses OpenAI GPT-4o for natural language understanding
- Generates ReactFlow-compatible DAG structures
- Handles clarification mode for missing parameters
- Manages conversation context and state transitions

**Executor Service** (`app/services/executor.py`)
- Topological sort for DAG execution
- Parameter resolution with variable references
- MCP server communication
- Execution logging and error handling

**Tool Detection Service** (`app/services/gemini.py`)
- Uses GPT-4o-mini for tool detection
- Identifies required integrations from queries
- Normalizes tool names (gmail → google)

#### 3. MCP Server Architecture

##### Generic MCP Server Structure
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from pymongo import MongoClient

app = FastAPI()

# Database connection for credential retrieval
mongo_client = MongoClient(MONGODB_URI)
db = mongo_client["nexflow"]
integrations_col = db["integrations"]

# Credential retrieval function
def get_provider_token(user_id: str) -> str:
    doc = integrations_col.find_one({"user_id": user_id})
    providers = doc.get("providers", [])
    provider = next((p for p in providers if p["provider"] == PROVIDER_NAME), None)
    return provider["credentials"]["access_token"]

# API endpoint pattern
@app.post("/invoke/{tool_name}")
def invoke_tool(request: ToolRequest):
    token = get_provider_token(request.user_id)
    # Make API call to external service
    # Return result
```

##### GitHub MCP (`github_mcp/server.py`)
**Port**: 8020
**Tools**: 18 GitHub operations
- Repository management: create, get, delete, list
- File operations: create, update, delete, get, list
- Branch management: create, list
- Issue tracking: create, list, close
- Pull requests: create, merge
- Commits: get, list
- Forking: fork_repo

##### Google MCP (`google_mcp/server.py`)
**Port**: 8030
**Tools**: 20+ Google Workspace operations
**Gmail Tools**:
- send, list, get, reply, search
- Label management: create, apply, remove, get_or_create
- Label filtering: label_messages

**Sheets Tools**:
- create, get, read, write, append, clear
- Sheet management: add_sheet, delete_rows, list

##### Discord MCP (`discord_mcp/main.py`)
**Port**: 8040
**Tools**: 10 Discord operations
- Messaging: send_message, send_dm, get_messages
- Channel management: list_channels, create_channel
- Server management: list_servers, get_server_info
- User operations: get_user
- Message operations: add_reaction, delete_message

##### Twilio MCP (`twilio_mcp/main.py`)
**Port**: 8050
**Tools**: 5 communication operations
- Calls: make_call, get_call_status
- SMS: send_sms, get_sms_status
- WhatsApp: send_whatsapp

#### 4. Data Flow Architecture

##### Query Processing Flow
```
User Query → Frontend → POST /process-query
    ↓
Tool Detection (GPT-4o-mini)
    ↓
Integration Check (MongoDB)
    ↓
Response: ready / missing_integrations
```

##### DAG Generation Flow
```
User Messages → POST /orchestrate
    ↓
Orchestrator (GPT-4o)
    ↓
ReactFlow JSON Generation
    ↓
Save to MongoDB (chats collection)
    ↓
Return DAG structure to frontend
```

##### DAG Execution Flow
```
POST /execute-dag
    ↓
Retrieve DAG from MongoDB
    ↓
Topological Sort (Executor)
    ↓
Parallel Execution (where possible)
    ↓
MCP Server Calls (via HTTP)
    ↓
External API Calls
    ↓
Result Aggregation & Logging
    ↓
Update MongoDB with results
    ↓
Return execution summary
```

---

## Database Design

### Database Overview
- **Database Name**: `nexflow`
- **Technology**: MongoDB Atlas
- **Reasoning**: Document-based storage for flexible schema evolution

### Collections

#### 1. users Collection
**Purpose**: Store user authentication and profile information

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,           // Unique user identifier
  email: String,             // User email (unique)
  name: String,              // Display name
  created_at: ISODate,       // Account creation timestamp
  updated_at: ISODate,       // Last update timestamp
  auth_provider: String,     // "google" | "github" | "email"
  last_login: ISODate        // Last login timestamp
}
```

**Indexes**:
- `user_id` (unique)
- `email` (unique)

#### 2. integrations Collection
**Purpose**: Store third-party service integrations and credentials

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,           // Reference to users.user_id
  providers: [
    {
      provider: String,      // "github" | "google" | "discord" | "twilio"
      credentials: {
        access_token: String,
        refresh_token: String (optional),
        expires_at: Number (optional),
        token_type: String,
        scope: [String] (optional)
      },
      meta: {
        provider_account_id: String,
        email: String (optional),
        name: String (optional)
      },
      connected_at: ISODate
    }
  ],
  meta: {
    email: String (optional)
  },
  created_at: ISODate,
  updated_at: ISODate
}
```

**Indexes**:
- `user_id` (unique)
- `meta.email` (for email-based lookups)

#### 3. chats Collection
**Purpose**: Store workflow sessions, DAG structures, and execution logs

**Schema**:
```javascript
{
  _id: ObjectId,
  user_id: String,           // Reference to users.user_id
  session_id: String,        // Unique session identifier
  chat_history: [
    {
      role: String,          // "user" | "agent"
      content: String,      // Message content
      timestamp: ISODate
    }
  ],
  react_flow: {
    nodes: [
      {
        id: String,
        type: String,
        position: { x: Number, y: Number },
        data: {
          label: String,
          tool: String,
          params: Object,
          status: String,    // "pending" | "running" | "success" | "error"
          depends_on: [String]
        },
        style: Object (optional)
      }
    ],
    edges: [
      {
        id: String,
        source: String,      // Source node ID
        target: String,      // Target node ID
        animated: Boolean
      }
    ]
  },
  execution_log: [
    {
      node_id: String,
      tool: String,
      params: Object,
      result: Object,
      success: Boolean,
      error: String (optional),
      executed_at: ISODate
    }
  ],
  completed: Boolean,        // Overall workflow completion status
  created_at: ISODate,
  updated_at: ISODate
}
```

**Indexes**:
- `user_id` + `session_id` (compound unique)
- `created_at` (for time-based queries)

### Database Relationships

```
users (1) ──────< (N) integrations
  │                    │
  │                    │
  └──────────< (N) chats
```

**Relationship Types**:
- **users → integrations**: One-to-many (one user can have multiple integrations)
- **users → chats**: One-to-many (one user can have multiple chat sessions)
- **integrations → providers**: One-to-many (one user document can have multiple provider integrations)

---

## ER Diagram

### Entity Relationship Diagram
```
┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ PK _id              │
│ UK user_id          │◄──────────┐
│ UK email            │           │
│    name             │           │
│    created_at       │           │
│    updated_at       │           │
│    auth_provider    │           │
│    last_login       │           │
└─────────────────────┘           │
                                  │
                                  │ 1
                                  │
                                  │ N
                                  │
┌─────────────────────┐           │
│   INTEGRATIONS      │           │
├─────────────────────┤           │
│ PK _id              │           │
│ FK user_id          │───────────┘
│    providers []     │◄──────────┐
│    meta {}          │           │
│    created_at       │           │
│    updated_at       │           │
└─────────────────────┘           │
                                  │
                                  │ 1
                                  │
                                  │ N
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼────────┐          ┌────────▼────────┐
            │  PROVIDERS    │          │     CHATS       │
            ├───────────────┤          ├─────────────────┤
            │ provider (UK) │          │ PK _id          │
            │ credentials {}│         │ FK user_id      │─────┘
            │ meta {}       │          │ UK session_id   │
            │ connected_at  │          │ chat_history []  │
            └───────────────┘          │ react_flow {}    │
                                        │ execution_log []│
                                        │ completed       │
                                        │ created_at      │
                                        │ updated_at      │
                                        └─────────────────┘
```

### Relationship Details

#### USERS ↔ INTEGRATIONS
- **Type**: One-to-Many
- **Foreign Key**: `integrations.user_id` → `users.user_id`
- **Cardinality**: One user can have multiple integration records (though typically one document with multiple providers)
- **Constraint**: `user_id` is unique in integrations collection

#### USERS ↔ CHATS
- **Type**: One-to-Many
- **Foreign Key**: `chats.user_id` → `users.user_id`
- **Cardinality**: One user can have multiple chat sessions
- **Constraint**: Compound unique index on `(user_id, session_id)`

#### INTEGRATIONS ↔ PROVIDERS
- **Type**: Embedded One-to-Many
- **Structure**: Providers are embedded as array within integrations document
- **Cardinality**: One integration document can have multiple provider entries
- **Providers**: github, google, discord, twilio

---

## MCP Generation & Dockerization

### MCP (Model Context Protocol) Architecture

#### MCP Server Design Pattern
Each MCP server follows a consistent microservice pattern:

```python
# Generic MCP Server Template
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Database Setup
mongo_client = MongoClient(os.environ["MONGODB_URI"])
db = mongo_client["nexflow"]
integrations_col = db["integrations"]

# FastAPI App
app = FastAPI()

# Credential Retrieval
def get_provider_token(user_id: str) -> str:
    doc = integrations_col.find_one({"user_id": user_id})
    if not doc:
        raise ValueError(f"No integration found for user_id: {user_id}")
    providers = doc.get("providers", [])
    provider = next((p for p in providers if p["provider"] == PROVIDER_NAME), None)
    if not provider:
        raise ValueError(f"No {PROVIDER_NAME} provider for user_id: {user_id}")
    return provider["credentials"]["access_token"]

# Tool Invocation Pattern
@app.post("/invoke/{tool_name}")
def invoke_tool(request: ToolRequest):
    try:
        token = get_provider_token(request.user_id)
        # Make external API call
        # Return standardized response
        return {"result": {...}}
    except Exception as e:
        return {"error": str(e)}
```

#### MCP Server Generation Process

##### 1. Tool Definition
Each MCP server defines its tools using Pydantic models:

```python
class ToolRequest(BaseModel):
    user_id: str
    # Tool-specific parameters

class CreateRepoRequest(BaseModel):
    user_id: str
    name: str
    description: str = ""
    private: bool = True
```

##### 2. API Endpoint Registration
Tools are registered as POST endpoints:

```python
@app.post("/invoke/github.create_repo")
def create_repo(req: CreateRepoRequest):
    # Implementation
```

##### 3. External API Integration
Each MCP server integrates with its respective external API:

- **GitHub MCP**: GitHub REST API v3
- **Google MCP**: Google API Client Libraries
- **Discord MCP**: Discord Bot API
- **Twilio MCP**: Twilio REST API

### Dockerization Strategy

#### Individual MCP Server Dockerfiles

##### Generic MCP Dockerfile Pattern
```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE <PORT>

# Start FastAPI with uvicorn
CMD ["uvicorn", "<module>:app", "--host", "0.0.0.0", "--port", "<PORT>"]
```

##### GitHub MCP Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8020

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8020"]
```

##### Google MCP Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8030

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8030"]
```

##### Discord MCP Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8040

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8040"]
```

##### Twilio MCP Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8050

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8050"]
```

##### Main MCP Agent Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8010

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8010", "--reload"]
```

#### Docker Compose Orchestration

##### Network Architecture
```yaml
networks:
  dagent_network:
    driver: bridge
```

All MCP services communicate via the `dagent_network` bridge network.

##### Service Configuration
```yaml
services:
  mcp_agent:
    build:
      context: ./mcp_agent
      dockerfile: Dockerfile
    container_name: mcp_agent
    ports:
      - "8010:8010"
    env_file:
      - ./mcp_agent/.env
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./mcp_agent:/app
    networks:
      - dagent_network
    restart: unless-stopped

  github_mcp:
    build:
      context: ./mcp_agent/github_mcp
      dockerfile: Dockerfile
    container_name: github_mcp
    ports:
      - "8020:8020"
    env_file:
      - ./mcp_agent/.env
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./mcp_agent/github_mcp:/app
    networks:
      - dagent_network
    restart: unless-stopped

  google_mcp:
    build:
      context: ./mcp_agent/google_mcp
      dockerfile: Dockerfile
    container_name: google_mcp
    ports:
      - "8030:8030"
    env_file:
      - ./mcp_agent/.env
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./mcp_agent/google_mcp:/app
    networks:
      - dagent_network
    restart: unless-stopped

  discord_mcp:
    build:
      context: ./mcp_agent/discord_mcp
      dockerfile: Dockerfile
    container_name: discord_mcp
    ports:
      - "8040:8040"
    env_file:
      - ./mcp_agent/.env
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./mcp_agent/discord_mcp:/app
    networks:
      - dagent_network
    restart: unless-stopped

  twilio_mcp:
    build:
      context: ./mcp_agent/twilio_mcp
      dockerfile: Dockerfile
    container_name: twilio_mcp
    ports:
      - "8050:8050"
    env_file:
      - ./mcp_agent/.env
    environment:
      - PYTHONUNBUFFERED=1
    volumes:
      - ./mcp_agent/twilio_mcp:/app
    networks:
      - dagent_network
    restart: unless-stopped
```

#### Port Mapping
| Service | Internal Port | External Port |
|---------|---------------|---------------|
| mcp_agent | 8010 | 8010 |
| github_mcp | 8020 | 8020 |
| google_mcp | 8030 | 8030 |
| discord_mcp | 8040 | 8040 |
| twilio_mcp | 8050 | 8050 |

#### Environment Variables
Each MCP service shares a common `.env` file:
```bash
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
DISCORD_BOT_TOKEN=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=...
TWILIO_TO_NUMBER=...
```

#### Volume Mounting
Development mode uses volume mounts for hot reloading:
```yaml
volumes:
  - ./mcp_agent:/app
```

Production mode would omit volumemounts for immutable containers.

#### Restart Policy
```yaml
restart: unless-stopped
```

Ensures services restart automatically on failure but not on manual stop.

### MCP Communication Protocol

#### Internal Service Communication
MCP servers communicate via HTTP REST API:

```python
# Example: Main agent calling GitHub MCP
GITHUB_MCP_URL = "http://github_mcp:8020"

response = httpx.post(
    f"{GITHUB_MCP_URL}/invoke/github.create_repo",
    json={"user_id": user_id, "name": "my-repo"},
    timeout=30
)
```

#### Standardized Response Format
All MCP endpoints return consistent responses:

**Success Response**:
```json
{
  "result": {
    // Tool-specific result data
  }
}
```

**Error Response**:
```json
{
  "error": "Error message description"
}
```

#### Tool Invocation Flow
```
Executor Service → HTTP POST → MCP Server
    ↓
Credential Retrieval (MongoDB)
    ↓
External API Call
    ↓
Response Standardization
    ↓
HTTP Response → Executor Service
```

---

## AI Integration & Prompt Engineering

### AI Models Used

#### 1. GPT-4o (Primary Orchestrator)
- **Purpose**: Main workflow orchestration and DAG generation
- **Model**: `gpt-4o`
- **Temperature**: 0.2 (low temperature for consistent outputs)
- **Response Format**: JSON-only mode

#### 2. GPT-4o-mini (Tool Detection)
- **Purpose**: Quick tool detection from queries
- **Model**: `gpt-4o-mini`
- **Temperature**: 0 (deterministic)
- **Response Format**: JSON array

### Prompt Engineering Strategy

#### System Prompt Architecture

##### Orchestrator System Prompt
The orchestrator uses a comprehensive system prompt with multiple modes:

```python
SYSTEM_PROMPT = """
You are DAGent - an AI workflow orchestrator. You help users automate tasks
using tools by building a DAG (Directed Acyclic Graph) of tool calls.

AVAILABLE TOOLS:
- github.create_repo(name, description, private)
- github.get_repo(owner, repo)
- github.list_repos()
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
- If task involves files/content in a repo: ALWAYS include create_repo node first
- NEVER assume repository exists - always create it unless user explicitly says "in existing repo X"
- For file operations: create_repo → create_file (depends on create_repo)
- Use {user} for owner when it's the authenticated user
- Each node must depend on previous nodes in sequence

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
    "nodes": [...],
    "edges": [...]
  },
  "tools_execution_plan": [...]
}

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
- Edges must reference valid node ids.
- position.x and position.y must be numbers, not strings.
- For Discord tools, channel_id and guild_id are numeric string IDs not names
- To find a channel_id by name, first call discord.list_channels with guild_id
- To find guild_id, first call discord.list_servers
- For discord.add_reaction, emoji must be URL encoded e.g. "thumbsup" not ":thumbsup:"
- Always call discord.list_servers first if guild_id is unknown
- For twilio tools, "to" is optional - if not specified it uses the default number
- For twilio.make_call, message is what will be SPOKEN on the call via text-to-speech
- For twilio.send_whatsapp, the to number must be WhatsApp-enabled
- After make_call or send_sms, you can check status with get_call_status or get_sms_status using the returned sid
- When user says "call and say X" -> use twilio.make_call with message = X
- When user says "text X" or "SMS X" -> use twilio.send_sms with message = X
"""
```

##### Tool Detection Prompt
```python
prompt = f"""
You are a tool detection system.

Available tools:
- github
- google (includes google_drive, gmail, contacts)
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
```

### Conversation State Management

#### Message History Structure
```python
messages = [
    {"role": "system", "content": SYSTEM_PROMPT},
    {"role": "user", "content": "Create a GitHub repository"},
    {"role": "assistant", "content": "{\"status\": \"clarify\", \"question\": \"...\"}"},
    {"role": "user", "content": "Name it 'my-awesome-repo'"},
    {"role": "assistant", "content": "{\"status\": \"dag_ready\", ...}"}
]
```

#### State Transitions
```
Initial Query → Clarify Mode (if missing params)
    ↓
User provides params → DAG Ready Mode
    ↓
User reviews → Confirm Mode
    ↓
User confirms → Execute DAG
    ↓
Completion → General Mode
```

### Variable Resolution System

#### Reference Patterns
The executor supports multiple variable reference patterns:

1. **User Placeholder**: `{user}` or `{authenticated_user}`
   - Resolved to authenticated user's username
   - Fetched via `github.get_authenticated_user`

2. **Node Reference**: `{node_id.field}`
   - Explicit reference to specific node output
   - Example: `{node_2.message_id}`

3. **Field Search**: `{field}`
   - Searches all previous nodes for the field
   - Returns first match in execution order

4. **List References**: `[{node_id.field}]`
   - Wraps single value in array
   - Used for label_ids parameters

#### Resolution Algorithm
```python
def resolve_params(params: dict, results: dict, user_id: str) -> dict:
    resolved = {}
    for key, value in params.items():
        if isinstance(value, str) and value in ("{user}", "{authenticated_user}"):
            # Fetch authenticated user
            resolved[key] = get_authenticated_user(user_id)
        elif isinstance(value, str) and value.startswith("{") and value.endswith("}"):
            # Resolve variable reference
            resolved[key] = resolve_variable_reference(value, results)
        elif isinstance(value, list):
            # Resolve list items recursively
            resolved[key] = [resolve_item(item, results) for item in value]
        else:
            resolved[key] = value
    return resolved
```

### DAG Generation Rules

#### Dependency Management
- **Sequential Dependencies**: File operations must follow repo creation
- **Parallel Execution**: Independent tasks run simultaneously
- **Critical Path**: Required dependencies block dependent tasks

#### ReactFlow Format
```json
{
  "nodes": [
    {
      "id": "node_1",
      "type": "default",
      "position": { "x": 250, "y": 0 },
      "data": {
        "label": "create_repo",
        "tool": "github.create_repo",
        "params": { "name": "my-repo", "description": "A repo", "private": false },
        "status": "pending",
        "depends_on": []
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
}
```

#### Layout Rules
- **X Position**: Always 250 for sequential nodes
- **Y Position**: 0 for first node, increment by 150
- **Parallel Tasks**: Same Y level, different X (250, 500, 750)

---

## Scalability Architecture

### Horizontal Scaling Strategy

#### 1. MCP Server Scaling
Each MCP server can be scaled independently based on load:

```yaml
# Docker Compose with scaling
github_mcp:
  deploy:
    replicas: 3
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

#### 2. Load Balancing
For production deployment, add a load balancer:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - github_mcp
      - google_mcp
```

### Vertical Scaling Considerations

#### Resource Allocation
| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| mcp_agent | 1-2 cores | 1-2 GB | 10 GB |
| github_mcp | 0.5-1 core | 512 MB | 5 GB |
| google_mcp | 0.5-1 core | 512 MB | 5 GB |
| discord_mcp | 0.5-1 core | 512 MB | 5 GB |
| twilio_mcp | 0.5-1 core | 512 MB | 5 GB |

#### Database Scaling
- **MongoDB Atlas**: Auto-scaling cluster
- **Read Replicas**: For read-heavy workloads
- **Indexing Strategy**: Optimize query performance

### Performance Optimization

#### 1. Caching Strategy
- **Redis Cache**: Cache frequently accessed data
- **API Response Caching**: Cache external API responses
- **DAG Caching**: Cache generated DAGs for similar queries

#### 2. Connection Pooling
```python
# MongoDB connection pooling
client = MongoClient(
    MONGODB_URI,
    maxPoolSize=50,
    minPoolSize=10,
    maxIdleTimeMS=30000
)

# HTTP client pooling
with httpx.Client(timeout=30, limits=httpx.Limits(max_connections=100)) as client:
    response = client.request(...)
```

#### 3. Async Processing
```python
# Convert to async for better concurrency
from fastapi import FastAPI
from httpx import AsyncClient

app = FastAPI()

async def call_tool_async(tool_name: str, params: dict):
    async with AsyncClient() as client:
        response = await client.post(url, json=params, timeout=30)
        return response.json()
```

### Monitoring & Observability

#### 1. Logging Strategy
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

#### 2. Metrics Collection
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Health Checks**: Service health monitoring

#### 3. Distributed Tracing
- **OpenTelemetry**: Distributed tracing
- **Jaeger**: Trace visualization

### Deployment Architecture

#### Development Environment
```yaml
# Local development with Docker Compose
docker-compose up --build
```

#### Production Environment
```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: github-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: github-mcp
  template:
    metadata:
      labels:
        app: github-mcp
    spec:
      containers:
      - name: github-mcp
        image: github-mcp:latest
        ports:
        - containerPort: 8020
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

#### CI/CD Pipeline
```yaml
# GitHub Actions example
name: Deploy MCP Servers

on:
  push:
    paths:
      - 'mcp_agent/**'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker images
        run: |
          docker build -t github-mcp ./mcp_agent/github_mcp
          docker build -t google-mcp ./mcp_agent/google_mcp
      - name: Push to registry
        run: |
          docker push github-mcp
          docker push google-mcp
      - name: Deploy to Kubernetes
        run: kubectl apply -f k8s/
```

### Security Considerations

#### 1. Credential Management
- **Environment Variables**: Never hardcode credentials
- **Secret Management**: Use HashiCorp Vault or AWS Secrets Manager
- **Rotation**: Regular credential rotation

#### 2. API Security
- **Rate Limiting**: Implement rate limiting
- **Authentication**: JWT token validation
- **Authorization**: Role-based access control

#### 3. Network Security
- **TLS Encryption**: All communications encrypted
- **Network Policies**: Kubernetes network policies
- **Firewall Rules**: Restrict access

### Disaster Recovery

#### 1. Backup Strategy
- **MongoDB Backups**: Daily automated backups
- **Point-in-Time Recovery**: Enable PITR
- **Cross-Region Replication**: Geo-redundancy

#### 2. High Availability
- **Multi-AZ Deployment**: Spread across availability zones
- **Health Checks**: Automated health monitoring
- **Auto-scaling**: Scale based on demand

### Cost Optimization

#### 1. Resource Optimization
- **Right-sizing**: Optimize resource allocation
- **Spot Instances**: Use spot instances for non-critical workloads
- **Reserved Instances**: For predictable workloads

#### 2. Monitoring Costs
- **Cost Alerts**: Set up cost alerts
- **Usage Tracking**: Monitor resource usage
- **Optimization**: Regular cost optimization reviews

---

## Conclusion

This architecture documentation provides a comprehensive overview of the DAGent platform, covering:

1. **High Level Design**: System architecture and component interactions
2. **Low Level Design**: Detailed component breakdown and data flow
3. **Database Design**: MongoDB schema and relationships
4. **ER Diagram**: Entity relationships and constraints
5. **MCP Generation**: MCP server architecture and Dockerization
6. **AI Integration**: Prompt engineering and conversation management
7. **Scalability**: Horizontal/vertical scaling and performance optimization

The architecture is designed for:
- **Modularity**: Independent MCP servers for easy maintenance
- **Scalability**: Horizontal and vertical scaling capabilities
- **Reliability**: Robust error handling and monitoring
- **Security**: Credential management and network security
- **Performance**: Caching, connection pooling, and async processing

This documentation serves as a reference for developers, architects, and DevOps engineers working on the DAGent platform.
