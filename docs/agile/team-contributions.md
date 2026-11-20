# Team Contributions

> **Method and limits.** Contributions below are inferred from `git log` (authors, dates, changed paths and commit messages) on all local branches. Commit counts are **not** a measure of effort or quality. A commit author is **not** assumed to be the sole person behind a feature. Anything Git cannot establish is marked *Ownership requires confirmation from the project team.* The remote's issues, pull requests and reviews were **not inspected**.

## 1. Member identifiers used throughout this package

| ID | Person (as shown in Git) | Git identities seen | Observed focus | Label |
|---|---|---|---|---|
| **M1** | Vishakha Sharma | "Vishakha", "Vishakha Sharma" (two different e-mail addresses) | Frontend components, UI pages, API route edits; created the first commits | [PARTIALLY VERIFIED] |
| **M2** | Prajinraj Ranawat | "Prajinraj Ranawat", "Prajinraj" (GitHub no-reply identity) | Python agent backend, GitHub/Google tool servers, orchestrator, deployment configuration, repository cleanup | [PARTIALLY VERIFIED] |
| **M3** | Fatema Shakir | None found in Git | Role not established from the repository; the team lead states M3 is a team member [PARTIALLY VERIFIED — not in repo]. Any work outside Git is [TEAM CONFIRMATION REQUIRED] | [UNKNOWN] |
| **AI-S1** | AI-assisted development session on 2026-10-28 (Claude Code) | Not committed — exists only in the working tree | See §4 | [VERIFIED that the changes exist and are uncommitted] |

**Identity merging is an assumption.** Treating the two "Vishakha" identities as one person, and the two "Prajinraj" identities as one person, is reasonable (matching names, adjacent timestamps) but **[TEAM CONFIRMATION REQUIRED]**. M3 (Fatema Shakir) has no Git identity in the repository, so nothing in Git can show her contribution — see checklist item A7. If there are further members, they are likewise invisible to this analysis.

## 2. Observed activity (commit-level facts)

| Member | Unique changes¹ | Active dates | Main paths touched (excluding build output) | Representative commits |
|---|---|---|---|---|
| M1 | 11 | 2026-04-10, 04-12, 08-06 | `src/components/{dashboard,auth,landing,shared}`, `src/app/api`, `src/hooks/useSessionManager.ts`, `README.md` | `f186bf3` "frontend commit"; `3a48472` "dashboard and oauth done"; `ab45fbf`…`1a896bb` (integrations route); `108f04a`; `ef4ed21`; `3296053` |
| M2 | 11 | 2026-04-11, 04-12, 08-06 | `mcp_agent/{app,github_mcp,google_mcp}`, `src/components/dashboard`, `src/app/api`, `Dockerfile`, `railway.toml`, `README.md`, `ARCHITECTURE_DOCUMENTATION.md` | `5d647c6` OAuth/Mongo fix; `941b6c6` orchestrator; `d078b21` ReactFlow crash fix; `208ca19` Railway; `6dd4781` cleanup; `402974e` architecture doc |

M3 has 0 commits, 0 pull requests and 0 attributable files in the repository. This says nothing about work done outside Git.

¹ 28 raw commits collapse to 22 unique changes because `production` and `main`/`prajinraj` contain parallel copies of many commits (same author, same minute, different hashes). Equal counts (11 / 11) do **not** imply equal contribution.

## 3. Contribution table

| Member | Role | Feature | Tasks | Contribution Evidence | Status | Verification Needed |
|---|---|---|---|---|---|---|
| M1 | Frontend (observed) | F-01 Landing | T-001 | `f186bf3`/`676bb25` "frontend commit"; paths `src/components/landing/*` | [PARTIALLY VERIFIED] | Whether M2 or others designed/contributed; design source |
| M1 | Frontend, integrations (observed) | F-03 Dashboard, F-07 OAuth | T-002, T-009 | `3a48472`/`1b62977` "dashboard and oauth done"; 4 edits to `src/app/api/integrations/route.ts` on 2026-04-12 (`ab45fbf`, `ee8fea3`, `fe84282`, `1a896bb`) and `108f04a` | [PARTIALLY VERIFIED] | Reason for the revert/re-apply pattern in route.ts; who tested |
| M2 | Backend (observed) | F-07 Connectors | T-003 | `5d647c6`/`9920198` message: nested provider schema, StrictMode double-invocation, duplicate prevention | [PARTIALLY VERIFIED] | Pairing/review with M1 |
| M2 | Backend, AI planner (observed) | F-04 Planner, F-05 DAG, F-06 Executor | T-004, T-006 | `941b6c6`/`97a18fc` (orchestrator, `/orchestrate`, `/execute-dag`, DagPanel); `d078b21` (position guard) | [PARTIALLY VERIFIED] | Prompt design decisions; who wrote the tool-server code |
| M2 | Backend / DevOps (observed) | F-08 Tool servers | — | `mcp_agent/github_mcp`, `mcp_agent/google_mcp` touched in M2 commits | [PARTIALLY VERIFIED] | **Authorship of `discord_mcp`, `twilio_mcp`, `multiplication_mcp` is not establishable from history** |
| M2 | DevOps (observed) | F-13 Deployment | T-007, T-008 | `208ca19` Railway config; `6dd4781`, `e1aba37`, `652afae`, `e680aca` cleanup | [VERIFIED] (commits) | Whether anything was actually deployed |
| M1, M2 | Documentation | F-14 | T-005, T-010 | `19198fa`, `635f6d6` (M2); `ef4ed21` (M1); `402974e` (M2), `3296053` (M1) | [VERIFIED] (commits) | Who authored the content of the 1,508-line architecture document |
| M1, M2 | Persistence, sharing (F-09, F-10) | F-09, F-10 | — | Present in initial/bulk commits; no per-feature commit | [UNKNOWN] | *Ownership requires confirmation from the project team.* |
| M3 | To be confirmed | None established | — | No commits, pull requests or files attributable in the repository | [UNKNOWN] | Non-Git contributions (design, research, testing, documentation, meetings): checklist A7; evidence must be supplied |
| AI-S1 | Implementation (AI-assisted) | F-02 (email/password), F-04 (graph agent), F-05, F-06, F-07 (Google connector, signed state), F-08 (tool fixes), F-11, F-12 | T-011 … T-019 | `git status`: 38 modified, 23 new, 5 deleted files, none committed | [VERIFIED] exists; [TEAM CONFIRMATION REQUIRED] who directed it and how it is to be credited | See §4 |

## 4. AI-assisted work — disclosure requiring a team decision

The working tree contains changes made during an interactive session with an AI coding assistant (Claude Code) on 2026-10-28. They are **uncommitted**, so Git attributes them to nobody. This package attributes them to the identifier **AI-S1**, not to M1 or M2. The Git configuration on the machine is that of M2, and the assistant's account e-mail belongs to a different identity — which person directed the session is therefore **[TEAM CONFIRMATION REQUIRED]**.

Before submission the team should:
1. Check the course's policy on AI-assisted code and documentation, and disclose accordingly.
2. Decide how to credit this work in commit messages (for example a `Co-Authored-By` trailer) when it is committed.
3. Review and be able to explain every change (the board lists them as unreviewed — [kanban-board](kanban-board.md) §2.2).

This documentation package was itself generated by an AI assistant from repository analysis; it must be reviewed by the team before being presented as the team's own record.

## 5. Team Contribution Verification Checklist (summary)

Full list: [team-verification-checklist](team-verification-checklist.md).

- [ ] Confirm every member's role (the team lead states three members: M1, M2, M3) and M3's contributions to date, with evidence.
- [ ] Confirm the identity merge (M1 = two Git identities, M2 = two Git identities).
- [ ] Confirm who wrote `discord_mcp`, `twilio_mcp`, the Chat/Session models and the share feature.
- [ ] Confirm who directed the 2026-10-28 AI-assisted session and approve its disclosure.
- [ ] Confirm review practice: did anyone review the other's code before 2026-10-28?
- [ ] Confirm workload split and any work done outside Git (design, research, testing, demos).

## 6. Going forward: shared, evidenced contribution

From the next planning checkpoint the remaining backlog is divided among M1, M2 and M3 by rotation, with a different member reviewing each card — see [work-allocation](work-allocation.md). That allocation is a **plan**. It does not change the historical record above, and it must not be used to present earlier work as shared equally. Real contributions will appear here as they are evidenced by commits under each member's own identity, pull-request reviews and board history.

Related: [work-allocation](work-allocation.md) · [feature-development-history](feature-development-history.md) · [challenges-and-risks](challenges-and-risks.md)
