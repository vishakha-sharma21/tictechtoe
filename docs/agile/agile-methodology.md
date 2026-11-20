# Agile Methodology — Observed Process, Selection and Critical Evaluation

> **Read this first.** This document separates what the team **actually did** (observed, from Git) from what this package **recommends retrospectively** ([PROPOSED]). The team did **not** leave any record of following Scrum, Kanban or Scrumban, and none is claimed here.

## 1. Observed development process (what the evidence shows)

| Observation | Evidence | Label |
|---|---|---|
| Work happened in short bursts, not on a fixed cadence: 4 unique changes on 2026-04-10, 4 on 04-11, 12 on 04-12, then 2 on 2026-08-06. No commits between 04-12 and 08-06. | `git log --all` (22 unique changes, all `+0530`) | [VERIFIED] |
| Two Git identities (M3 has none) with a visible split: M1 (Vishakha Sharma) touched `src/components/**` and `src/app/api/**`; M2 (Prajinraj Ranawat) touched `mcp_agent/**`, deployment and the orchestrator. | `git log --name-only` per author | [VERIFIED] |
| No merge commits and no pull-request references in history. Several commits were made through the GitHub web UI ("Update route.ts", "Add files via upload"). | `git log --merges` is empty; commit subjects | [VERIFIED] |
| Parallel copies of the same commits exist on `production` and on `main`/`prajinraj` (same author, same minute, different hashes). | `git branch --contains` for pairs such as `13ca5da`/`97d96b4` | [VERIFIED]; cause [TEAM CONFIRMATION REQUIRED] |
| Quality problems were fixed reactively (crash fixes, build artefacts committed then removed). | Commits `d078b21`, `6dd4781`, `e1aba37`, `652afae`, `e680aca` | [VERIFIED] |
| No sprint plan, board export, meeting notes, retrospective, issue or PR text exists in the repository. | repository search; remote not queried | [VERIFIED] (local); remote [TEAM CONFIRMATION REQUIRED] |
| No automated tests and no CI configuration. | `git ls-files` — 0 test files, no `.github/` | [VERIFIED] |

**Conclusion on the actual process:** an informal, continuous, role-split workflow with direct pushes — closest in spirit to *ad-hoc Kanban without a visible board*. It is not Scrum: there is no evidence of fixed sprints, planning, reviews or retrospectives.

## 2. Selection of a methodology [PROPOSED]

### 2.1 Project characteristics that drive the choice

| Factor | Finding | Source |
|---|---|---|
| Team size | 3 members per the team lead (M1, M2, M3); 2 Git identities | team-lead statement [PARTIALLY VERIFIED]; `git shortlog` |
| Duration | Active ≈3 days (Apr 10–12) + 1 evening (Aug 6); later work 2026-10-28 | `git log` |
| Cadence | Bursty, not fixed-length | commit dates |
| Requirements stability | Changed materially: auth model, integration schema, orchestrator prompts and execution model all changed after first delivery | commits `5d647c6`, `941b6c6`; working-tree diff |
| Dependencies between tasks | High (login → connectors → planner → executor → tool servers) | architecture, [project-overview](project-overview.md) |
| Independent parallel work | Yes — frontend and backend streams | author/file split |
| External constraints | Third-party quotas, OAuth app approval, API enablement (observed during 2026-10-28 work) | [challenges-and-risks](challenges-and-risks.md) |

### 2.2 Candidates considered

| Criterion | Kanban | Scrum | Scrumban | Lightweight hybrid |
|---|---|---|---|---|
| Planning approach | Continuous pull; no fixed plan | Fixed-length sprint plan with committed scope | Pull system plus periodic (e.g. fortnightly) re-planning | Mix chosen ad hoc |
| Work visualisation | Board with WIP limits | Sprint board + burndown | Board with WIP limits and a light cadence | Varies |
| Iteration structure | None | 1–4 week sprints | Optional short planning cycles | Informal |
| Meetings / ceremonies | Optional (replenishment, review) | Planning, daily scrum, review, retrospective | Short planning, brief sync, retrospective | Ad hoc |
| Handling changing priorities | Excellent (reprioritise any time) | Poor mid-sprint (changes wait for next sprint) | Good | Good |
| Delivery cadence | Continuous | End of each sprint | Continuous with periodic review | Irregular |
| Work in progress | Explicit WIP limits | Limited by sprint scope | Explicit WIP limits | Unlimited |
| Progress measurement | Cycle time, throughput | Velocity, burndown | Cycle time + planned-vs-done per cycle | Little |
| Strengths | Flexible, low overhead, exposes bottlenecks | Strong cadence, commitment, review rhythm | Keeps Kanban flexibility plus a review rhythm | No process cost |
| Weaknesses | No natural deadline rhythm; easy to drift | Overhead for 3 people; estimation needs history the team does not have | Needs discipline to keep both parts light | No visibility, repeats the observed problems |
| Suitability here | Good | Fair | **Best** | Poor |

### 2.3 Selected (recommended) methodology: **Scrumban** [PROPOSED]

**Reasons**

1. *Requirements and priorities changed repeatedly* (auth, schema and execution model were redesigned). Scrum would delay such changes to sprint boundaries; Scrumban lets them enter the board whenever the "Ready" column has room.
2. *Small team (three members).* Daily scrums, formal sprint planning and velocity add overhead that would exceed their value; a board plus a short weekly sync and a fortnightly review/retrospective is proportionate.
3. *Many cross-cutting dependencies and external blockers* (API enablement, OAuth app registration, provider quotas). WIP limits and an explicit "Blocked" convention make these visible; Kanban-style flow metrics show where work waits.
4. *No historical estimates exist.* Scrum velocity cannot be defended; cycle time and throughput can be measured from the first card onward.
5. *The graded artefact needs evidence of planning, review and reflection.* The light sprint-like cadence of Scrumban provides review and retrospective checkpoints that pure Kanban does not.

**Practices adopted:** product backlog with ordered priorities; Kanban board with WIP limits ([kanban-board](kanban-board.md)); fortnightly planning/review/retrospective ([sprint-plan](sprint-plan.md), [retrospective](retrospective.md)); Definition of Ready and Done; cycle-time and throughput measurement ([agile-metrics](agile-metrics.md)).

**Expected benefits:** visible bottlenecks (review and testing), fewer reactive "fix the fix" commits, an auditable record of decisions.

**Limitations / costs:** needs consistent board hygiene; flow metrics are meaningless with fewer than ~15–20 completed cards; with two people, "code review" is a one-reviewer check and can stall when the reviewer is unavailable; discipline problems are not solved by the framework.

**Practical adoption challenges:** the team must start recording work (cards, review comments) before metrics exist; moving from direct pushes to pull requests changes habits; the existing parallel `production` vs `main` branch arrangement needs a decision ([challenges-and-risks](challenges-and-risks.md), ISS-004).

### 2.4 Why the alternatives are less suitable

- **Scrum:** estimation without velocity history is guesswork, ceremonies cost more than the team size justifies, and mid-sprint requirement changes (which occurred) would be awkward.
- **Pure Kanban:** fits the flow but gives no natural point to review and reflect — the part the repository most lacks evidence of.
- **Lightweight hybrid (status quo):** produced no visible plan, tests, or review trail; it is the baseline to improve on.

## 3. Critical evaluation of the selected methodology

Each item answers: what it means → why it matters → how it applies here → observed or potential → action.

### 3.1 Advantages

| Advantage | Meaning | Why it matters | Application to this project | Observed / potential | Action |
|---|---|---|---|---|---|
| Visibility of work | Everyone sees the state of every task | Prevents duplicate or forgotten work | Commits show duplicated work across branches and re-applied changes | Observed problem it would address (ISS-004, ISS-005) | Adopt the board in [kanban-board](kanban-board.md) |
| Adaptability to change | Re-prioritise without waiting for a sprint end | Requirements shifted often | Auth model and execution model were redesigned after first delivery | Observed need | Keep a "Ready" buffer of ≤5 cards |
| Incremental delivery | Small shippable slices | Reduces risk of big-bang rewrites | The 2026-04-12 cleanup touched 261 files in one commit (`d078b21`) | Observed risk | Limit card size to ≤2 days |
| Early feedback | Stakeholder review each cycle | Catches wrong assumptions early | Assessor/user feedback records: none found | Potential — [TEAM CONFIRMATION REQUIRED] | Schedule a review each cycle |
| Continuous testing | Testing is a board stage, not an end phase | Defects found near their cause | 0 automated tests exist | Observed gap | Add "Testing" gate and CI ([sprint-plan](sprint-plan.md)) |
| Prioritisation of high-value work | Backlog ordered by value | Limited time on a student project | Security and integrations were addressed after features | Observed (ordering) | MoSCoW priorities in [product-backlog](product-backlog.md) |
| Early blocker identification | Blocked cards flagged immediately | External dependencies are frequent | API-not-enabled and quota blockers appeared in the 2026-10-28 session | Observed | "Blocked" marker + owner + next action |
| Collaboration | Shared ownership of the board | Role split could silo knowledge | M1 frontend / M2 backend split | Potential concern | Cross-review across the split |

### 3.2 Disadvantages and limitations

| Limitation | Meaning | Why it matters | Application to this project | Observed / potential | Action |
|---|---|---|---|---|---|
| Estimation uncertainty | Sizes are guesses without history | Plans can look precise but be wrong | No historical estimates exist | Potential | Use relative sizing; track actual cycle time |
| Coordination overhead | Meetings and board upkeep take time | Big relative cost for 3 people | Possible | Potential | Keep syncs ≤15 min; async updates |
| Scope creep | Always-open backlog invites additions | Time-boxed project | Feature additions (5 LLM providers, parallel execution) arrived late | Observed | WIP and Ready limits; explicit "Won't Have (now)" |
| Dependence on discipline | Framework works only if followed | The team left no process records | Observed absence of records | Observed | Definition of Done checklist; PR template |
| Documentation can lag | Agile favours working software | Assessors need records | `ARCHITECTURE_DOCUMENTATION.md` is out of date relative to the code | Observed | Documentation card in every cycle |
| Review/testing bottlenecks | Work waits for a reviewer or tester | Small teams have few reviewers; each card needs someone other than its author | No review evidence at all | Potential | WIP limit on Code Review; time-boxed review |
| Dependency coordination | Cards block each other | Long chains (auth→connectors→planner→executor) | Executor changes needed planner changes | Observed during 2026-10-28 | Dependency column in cards |
| Uneven workload | One person absorbs urgent work | Burnout / bias in assessment | Burst of 12 changes on 2026-04-12 | Potential — [TEAM CONFIRMATION REQUIRED] | Review workload each retrospective |
| Reduced predictability | Priorities change | Hard to promise a date | Possible | Potential | Forecast with throughput ranges, not dates |
| Poorly defined requirements | Vague stories → rework | Planner prompts changed repeatedly | Several rewrites of orchestration prompts | Observed | Acceptance criteria before "Ready" |

## 4. Recommendation

Adopt **Scrumban** with: 1-week planning checkpoints (30 min), a continuous board with WIP limits, a fortnightly review + retrospective, mandatory pull-request review across the frontend/backend split, and CI running the (to-be-written) tests. Treat this as a **forward-looking recommendation**; it must not be presented to assessors as the process that was historically followed.

Related: [kanban-board](kanban-board.md) · [sprint-plan](sprint-plan.md) · [agile-metrics](agile-metrics.md)
