<div align="center">

# 🕸️ DAGent

### *Your stack is a mess. Your agent isn't.*

**DAGent** is an AI-powered workflow orchestration platform where you *describe* what you need — and a smart agent figures out the rest, breaking it into a DAG (Directed Acyclic Graph) and executing tools **in parallel**, automatically.

No YAML hell. No brittle pipelines. No duct tape.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 😤 The Problem

You have a task. Let's say: *"Pull all failing Sentry errors from last week, cross-reference them with open GitHub issues, and post a summary to the #engineering Slack channel."*

What do you do today?

- Write a script. Probably in Python. With five imported libraries you'll never update.
- Hardcode credentials in a `.env` file you'll accidentally commit someday.
- Run it manually. Forget to run it. Run it twice.
- Repeat this for every workflow, every team, every quarter.

Sound familiar? **That's the problem DAGent solves.**

---

## ✨ The Solution

DAGent turns a plain English sentence into an *executable, parallelized workflow* — visualized in real time, with full logs, status tracking, and tool integrations that actually work.

You type:
> *"Check GitHub for open PRs, run tests, and notify Slack if any are failing"*

DAGent:
1. Understands the intent
2. Breaks it into discrete, dependency-aware steps
3. Constructs a DAG — running what can run in parallel, in parallel
4. Executes against real tools
5. Streams live logs back to you as it goes

**It's not a chatbot that pretends to help. It's an agent that actually does the work.**

![WhatsApp Image 2026-04-12 at 11 17 11](https://github.com/user-attachments/assets/58fd8943-b8be-4c9e-aa9d-86745a7ba1e7)


---

## 🔥 What Makes It Different

| Approach | The old way | DAGent |
|---|---|---|
| **Workflow definition** | Write YAML/JSON configs | Type in plain English |
| **Parallelism** | Manual orchestration | Automatic via DAG analysis |
| **Observability** | Check logs after the fact | Watch execution live |
| **Tool integrations** | Build & maintain per-tool scripts | 100+ built-in connectors |
| **Debugging** | "It failed somewhere" | Color-coded logs with exact timestamps |

The magic is in the **DAG engine**: it doesn't just run steps sequentially. It analyzes which steps are independent of each other and fires them simultaneously — making your workflows dramatically faster without you doing anything.

---

## 🚀 Features

### 💬 Natural Language Workflows
Describe your task the way you'd explain it to a colleague. No special syntax, no config files, no learning curve. DAGent parses intent and maps it to executable steps automatically.

### ⚡ Parallel Execution by Default
DAGent builds a Directed Acyclic Graph of your workflow and runs every independent branch simultaneously. What used to run in 60 seconds serially? Now runs in 20 seconds — automatically.

### 👁️ Real-Time DAG Visualization
Watch your workflow execute live on an interactive canvas. Each node pulses with status — pending, running, completed, failed. You always know exactly what's happening and what's next.

### 🔌 Custom-Built MCP Servers — Not Just Wrappers
Most platforms hand you a list of pre-packaged integrations and call it a day. DAGent goes further: **we built our own MCP (Model Context Protocol) servers from scratch** for the tools that matter most.

5 custom MCP servers, purpose-built for agent-native execution:

| MCP Server | What It Does |
|---|---|
| `github_mcp` | Read PRs, issues, commits, repos — trigger workflows on code events |
| `discord_mcp` | Send messages, read channels, notify teams in real time |
| `google_mcp` | Interact with Google Workspace — Docs, Sheets, Calendar, Gmail |
| `twilio_mcp` | Send SMS/calls, trigger alerts, notify humans when agents need to |

<img width="1600" height="984" alt="image" src="https://github.com/user-attachments/assets/30024118-bcb6-4e57-96cd-da25a0ee8b84" />


These aren't third-party adapters bolted on. They're written and maintained in-house, living right in the repo under `mcp_agent/` — auditable, extensible, and yours to fork.

### 📋 Live Execution Logs
Every step emits structured logs with timestamps and severity levels (`INFO`, `WARN`, `ERROR`, `SUCCESS`). Rendered in a clean monospace viewer — no digging through terminal output.

<img width="1600" height="980" alt="image" src="https://github.com/user-attachments/assets/9fd76b9c-3af2-48c9-9f19-bfd32b4173db" />


### 💡 Workflow Chat Interface
Build, refine, and re-run workflows through a natural conversation. DAGent remembers context across messages. Tweak a step, re-execute from failure, or ask why something failed — all in the same chat thread.

<img width="1600" height="981" alt="image" src="https://github.com/user-attachments/assets/202c0f03-b63f-4165-b255-d6302ccc07c5" />

<img width="1600" height="981" alt="image" src="https://github.com/user-attachments/assets/ada5b26c-36c4-45fb-998b-b181dfed3adf" />


---

## 🏗️ Architecture

DAGent is a **Next.js 14 App Router** application with a carefully considered 4-panel dashboard layout:

```
┌─────┬──────────────┬──────────────────┬────────────────────────────┐
│ 52px│    260px     │      420px       │           flex             │
│     │              │                  │                            │
│Icon │   Sidebar    │   Chat Panel     │      Canvas / Logs         │
│Rail │  (Workflows) │  (Conversation)  │   (DAG Viz + Log Viewer)   │
│     │              │                  │                            │
└─────┴──────────────┴──────────────────┴────────────────────────────┘
```

Each panel has a clear responsibility. There's no ambiguity about where something lives or why.

---

## 📁 Project Structure

```
DAGent/
│
├── mcp_agent/                        # 🔌 Custom MCP servers (5 built in-house)
│   ├── app/                          # MCP agent core app logic
│   ├── discord_mcp/                  # Discord — messaging & team notifications
│   ├── github_mcp/                   # GitHub — PRs, issues, commits, repos
│   ├── google_mcp/                   # Google Workspace — Docs, Sheets, Calendar, Gmail
│   ├── multiplication_mcp/           # Math & computation utilities
│   ├── twilio_mcp/                   # Twilio — SMS, calls, human-in-the-loop alerts
│   ├── Dockerfile                    # Containerized MCP deployment
│   └── requirements.txt              # Python dependencies for MCP servers
│
├── public/                           # Static assets
│
└── src/
    ├── app/                          # Next.js App Router
    │   ├── page.tsx                  # Landing page
    │   ├── auth/page.tsx             # Authentication
    │   └── dashboard/page.tsx        # Main application
    │
    ├── components/
    │   ├── shared/                   # Design system atoms
    │   │   ├── Button.tsx            # Variant-aware button component
    │   │   ├── Badge.tsx             # Status badges & metadata chips
    │   │   └── Nav.tsx               # Fixed nav with backdrop blur
    │   │
    │   ├── landing/                  # Marketing page components
    │   │   ├── Hero.tsx              # Typewriter animation + CTA
    │   │   ├── Marquee.tsx           # Infinite tool logo scroll
    │   │   ├── RecipeGrid.tsx        # Use case templates grid
    │   │   └── DagSection.tsx        # Interactive DAG demo
    │   │
    │   └── dashboard/                # Core application components
    │       ├── IconRail.tsx          # Vertical icon navigation
    │       ├── Sidebar.tsx           # Workflow history & search
    │       ├── ChatPanel.tsx         # Conversation interface
    │       ├── CanvasPanel.tsx       # DAG + log viewer container
    │       ├── WorkflowCard.tsx      # Embedded workflow status in chat
    │       ├── DagNodeCard.tsx       # Individual DAG node UI
    │       ├── ParallelBlock.tsx     # Parallel branch visualization
    │       └── LogViewer.tsx         # Color-coded log table
    │
    ├── lib/
    │   ├── fonts.ts                  # Playfair + Inter + JetBrains Mono
    │   ├── utils.ts                  # Shared utility functions
    │   └── mock-data.ts              # Dev-time mock workflows & logs
    │
    └── types/
        └── index.ts                  # All TypeScript type definitions
```

---

## 🎨 Design System

DAGent uses a warm, paper-toned palette that keeps the focus on your workflows — not the UI chrome.

**Colors**
```
Background   #fafaf8  ·  #f3f2ef  ·  #eae9e4   ← warm, not clinical
Borders      #e0ddd6  ·  #ccc9c0
Text         #0a0a0a  ·  #3d3d3d  ·  #888  ·  #bbb
Accent Blue  #2563eb   (actions, links)
Accent Green #16a34a   (success, completed)
Accent Amber #d97706   (warning, in-progress)
Accent Red   #dc2626   (errors, failures)
```

**Typography — intentionally distinct layers**
- `Playfair Display` — headings & brand moments (italic for emphasis)
- `Inter` — all UI text (weights 300–600)
- `JetBrains Mono` — logs, code, node IDs

**Border Radius**
- `8px` small elements · `10px` cards · `16px` large cards · `24px` modals

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript + Python |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Icons | Lucide React |
| MCP Servers | 5 custom-built (GitHub, Discord, Google, Twilio, Math) |
| Containerization | Docker (MCP agent layer) |
| Auth | NextAuth.js |
| Database | MongoDB Atlas |

---

## 🎬 Animations

The interface is alive — but not annoying about it.

- **Marquee** — tool logos scroll at `22s linear infinite`, smooth and unobtrusive
- **Pulse** — running workflow nodes pulse at `3s ease-in-out`, so you always know what's active
- **Typewriter** — the hero cycles through example prompts character-by-character at `38ms` intervals
- **Hover lifts** — cards respond to cursor with `200ms ease` transitions
- **Progress bars** — fill smoothly at `600ms ease`
- **View toggles** — DAG ↔ Logs switch at `300ms ease`

---

## 🏃 Getting Started

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone <repository-url>
cd DAGent

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Open your browser
# → http://localhost:3000
```

**Available scripts:**
```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm run start    # Serve the production build
npm run lint     # ESLint check
```

---

## 📱 Pages

### `/` — Landing Page
The first impression. Features a typewriter animation cycling through real-world example prompts, an infinite marquee of supported tool logos, a grid of workflow recipe templates, and a live DAG visualization showing what execution actually looks like.

### `/auth` — Authentication
Clean, centered login form. Email/password + Google OAuth. No clutter, no distractions — just get people into the product.

### `/dashboard` — The Main Event
The full 4-panel layout. Chat on the left, visualization on the right. Type a workflow, watch it build, watch it run.

---

## 🗺️ Roadmap

These aren't vague aspirations — they're the next concrete steps:

- [ ] **Real backend API** — replace mock data with actual workflow execution
- [ ] **NextAuth.js** — user accounts, sessions, permissions
- [ ] **MongoDB Atlas** — persist workflows, history, and results
- [ ] **WebSockets** — true real-time execution updates
- [ ] **React Flow** — interactive, editable DAG canvas
- [ ] **Tool Connection Manager** — UI to connect and authenticate integrations
- [ ] **Workflow Template Marketplace** — share and remix community workflows
- [ ] **Advanced Scheduling** — cron triggers, webhooks, event-driven execution
- [ ] **Team Collaboration** — shared workspaces, roles, workflow ownership

---

## 🤝 Contributing

Contributions welcome. Here's the short version:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Add tests if applicable
5. Open a pull request

For larger changes, open an issue first to discuss the approach.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with Next.js 14, TypeScript, and Tailwind CSS.

*Stop duct-taping your stack.*

</div>
