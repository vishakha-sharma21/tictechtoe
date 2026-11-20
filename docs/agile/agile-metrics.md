# Agile Metrics and Project Health

> **Principle:** a value appears only if reliable data exists. Everything else is marked `NOT CALCULABLE`, with the data that would be needed. No velocity, cycle time, lead time or defect rate is estimated or invented. Measurement period for all Git-derived figures: **2026-04-10 → 2026-08-06** (all timestamps `+0530`), plus the uncommitted working tree as observed on **2026-10-28**.

## 1. Metrics that can be calculated from the repository

| Metric | Definition | Value | Period | Data source | Limitations |
|---|---|---|---|---|---|
| Raw commits (all branches) | `git rev-list --all --count` | **28** | 2026-04-10 → 2026-08-06 | Git | Includes parallel copies on different branches |
| Unique logical changes | Distinct (author, subject, minute) | **22** | same | Git | Treats same-minute, same-subject commits as one; identity merge is an assumption |
| Active days | Distinct commit dates | **4** (04-10, 04-11, 04-12, 08-06) | same | Git | Work outside Git (design, research, testing) is invisible |
| Unique changes per active day | 4, 4, 12, 2 | mean **5.5**; max 12 on 2026-04-12 | same | Git | Descriptive only; not throughput (commits are not work items) |
| Duration of the main delivery burst | First to last commit of 2026-04-10…12 | **≈43 hours** (04-10 16:16 → 04-12 11:21) | same | Git | Calendar time, not effort |
| Gap in activity | Days without commits between bursts | **116 days** (2026-04-12 → 2026-08-06) | same | Git | Cause unknown |
| Unique changes per member | By merged identity | M1 = 11, M2 = 11, M3 = 0 (no Git identity; work outside Git is invisible here) | same | Git | **Not** a measure of contribution (see [team-contributions](team-contributions.md)) |
| Fix-type changes | Unique subjects containing "fix" | **3 of 17 unique subjects** (22 unique changes) | same | Git | Crude keyword match; "Update route.ts" edits may also be fixes |
| API route handlers | `route.ts` files under `src/app/api` | **19 at `HEAD` → 23 in working tree** | snapshot | file system | Count, not quality |
| TypeScript/TSX source files | `src/**/*.ts(x)` | **89 at `HEAD` → 101 in working tree** | snapshot | file system | — |
| Python source files | `mcp_agent/**/*.py` (excluding `.venv`) | **15 at `HEAD` → 19 in working tree** | snapshot | file system | — |
| Size of code base | Lines in TS/TSX and Python | ≈**7,400 TS/TSX**, ≈**3,700 Python** | 2026-10-28 | `wc -l` | Includes generated-style UI code |
| Tool count | `@app.post("/invoke/…")` endpoints | **56** (GitHub 21, Google 20, Discord 10, Twilio 5) | 2026-10-28 | source | Counts endpoints, not tested tools |
| Uncommitted change set | `git status --short` at discovery | **66 entries** (38 modified, 23 new, 5 deleted) | 2026-10-28 | Git | Changes as the working tree is edited |
| Automated tests | Test files tracked | **0** | 2026-10-28 | `git ls-files` | — |
| Static checks | `tsc --noEmit`; Python `ast.parse` | **0 type errors; 0 syntax errors in 19 files** | 2026-10-28 | commands in [testing-and-quality-assurance](testing-and-quality-assurance.md) | Compilation only |

## 2. Metrics that cannot be calculated, and why

| Metric | Definition | Why it is useful | Data required | Status |
|---|---|---|---|---|
| Lead time | Request → delivered | Shows responsiveness | Card creation and completion timestamps | NOT CALCULABLE — no board or issue tracker data |
| Cycle time | Work started → finished | Exposes bottlenecks; basis for forecasts | Per-card "started"/"done" timestamps | NOT CALCULABLE |
| Throughput | Cards completed per period | Forecasting | Completed-card log | NOT CALCULABLE (commits are not cards) |
| Work in progress | Cards in progress at a time | Detects overload | Board history | NOT CALCULABLE historically. *Reconstructed snapshot:* 10 cards in Code Review versus a proposed limit of 3 ([kanban-board](kanban-board.md)) — a proposal-based observation, not a measurement of past practice |
| Defect count / density | Confirmed defects (per size) | Quality signal | A defect log with severity and found/fixed dates | NOT CALCULABLE — [challenges-and-risks](challenges-and-risks.md) lists issues found by analysis, which is not a defect log |
| Defect resolution time | Found → fixed | Responsiveness to quality problems | Found/fixed timestamps | NOT CALCULABLE (only ISS-003's fix commit date is known; its report date is not) |
| Test coverage | Lines/branches executed by tests | Confidence in change | A coverage tool plus tests | NOT CALCULABLE — no tests exist |
| Sprint completion rate / planned vs completed | Completed ÷ committed points | Planning accuracy | Sprint commitments and results | NOT CALCULABLE — no sprints were run |
| Velocity | Story points completed per sprint | Capacity planning | Estimated and completed points per sprint | **Not retrospectively computed** — no estimates or completion records exist |
| Blocked-task duration | Time cards spend blocked | Shows external dependency cost | Blocked flags with dates | NOT CALCULABLE |
| Deployment frequency | Production deployments per period | Delivery health | Deployment logs | NOT CALCULABLE — `railway.toml` exists, but no deployment record was found; actual deployments **[UNKNOWN]** |

## 3. How to start collecting the data [PROPOSED]

| Metric | Process |
|---|---|
| Lead/cycle time, throughput, WIP | Use a board with automatic timestamps (GitHub Projects, Trello, Jira) following [kanban-board](kanban-board.md); record "Ready", "In Progress", "Done" transitions; review a cumulative flow diagram at each retrospective |
| Blocked time | Add a *Blocked* flag with reason and date to cards |
| Defects | Label issues `bug`; record `found` and `fixed` dates and severity; link the fixing PR |
| Coverage | Add `pytest --cov` and a JS coverage tool; publish the percentage from CI; do **not** set a target until a baseline exists |
| Deployment frequency | Record each deploy (CI job or Railway deployment log) |
| Sprint metrics | Only after at least three completed sprints with estimates; until then report planned-vs-done per cycle without velocity |

## 4. Interpretation guard

With 22 unique changes over 4 days, no flow metric would be statistically meaningful even if it could be computed. The honest project-health statement supported by the data is: *activity was bursty; most delivery happened in one 43-hour window; quality controls (tests, CI, review records) were absent; a substantial amount of recent work awaits review and commit.*

Related: [testing-and-quality-assurance](testing-and-quality-assurance.md) · [project-timeline](project-timeline.md) · [retrospective](retrospective.md)
