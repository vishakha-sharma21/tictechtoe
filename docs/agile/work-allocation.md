# Work Allocation (round-robin) — going forward

> **Status: [PROPOSED] plan, decided by the team lead.** Nothing in this file describes work already done. Past contributions are recorded, with evidence, in [team-contributions](team-contributions.md); they are **not** changed by this allocation. Story points are relative estimates [PROPOSED] and are not a measure of effort already spent.

## 1. Purpose and honest framing

The team has three members: **M1 Vishakha Sharma**, **M2 Prajinraj Ranawat**, **M3 Fatema Shakir** (team size stated by the team lead; the repository shows only M1 and M2 as Git identities). The team started using an AI coding assistant late, and a large amount of recently built work is uncommitted ([kanban-board](kanban-board.md) §2.2). To make future contribution **equal and provable**, the remaining backlog is divided among all three members in a fixed rotation, and each card has a different member as reviewer.

What this allocation **does**: gives everyone the same number of cards, nearly the same number of story points, and the same number of reviews to perform, starting now.

What it **does not do**: it does not credit anyone with work that was done before, and the manager report should not present it as if it did (see §6).

## 2. Rules

1. **Rotation:** cards are taken in priority order (Must, then Should, then Could; within a priority, by card order below) and assigned **M1 → M2 → M3 → M1 …**. The pointer after the last card below is **M1**: the next new card goes to M1.
2. **Reviewer:** the reviewer is the next person in the rotation after the owner (M1's cards → M2, M2's → M3, M3's → M1). Nobody reviews their own card.
3. **Balance check:** at each planning checkpoint, if any member's cumulative story points differ from another's by more than 3, the next card goes to the member with the fewest points instead of the pointer. Record the exception here.
4. **Swaps:** two members may swap cards by mutual agreement; record the swap and reason in the table below.
5. **"Owner" on the "Review, test and commit" cards:** these cards cover code that was generated in an AI-assisted session ([team-contributions](team-contributions.md) §4). The owner must read the code, run it, write or extend its tests, be able to explain it to the manager, and commit it **under their own Git identity**. Ownership means doing that real work; it is not a paper assignment.
6. **No skill matching:** rotation deliberately ignores the frontend/backend split seen in Git history so everyone learns the whole system. If the schedule is at risk, the owner may pair with a member who knows the area, and the pairing is recorded as a note on the card.

## 3. Allocation

| Order | Card | Task | SP [PROPOSED] | Priority | Sprint | Owner | Reviewer |
|---|---|---|---|---|---|---|---|
| 1 | T-031 | Rotate credentials that were shared during development | 1 | Must | 5 | **M1 Vishakha Sharma** | M2 Prajinraj Ranawat |
| 2 | T-011 | Review, test and commit: email/password sign-up/login, Google identity-only | 3 | Must | 5 | **M2 Prajinraj Ranawat** | M3 Fatema Shakir |
| 3 | T-012 | Review, test and commit: signed OAuth state, Google connector, removal of open endpoints | 3 | Must | 5 | **M3 Fatema Shakir** | M1 Vishakha Sharma |
| 4 | T-013 | Review, test and commit: backend JWT auth and AES-256-GCM key encryption | 3 | Must | 5 | **M1 Vishakha Sharma** | M2 Prajinraj Ranawat |
| 5 | T-014 | Review, test and commit: own-key LLM support (5 providers) and key switcher | 3 | Must | 5 | **M2 Prajinraj Ranawat** | M3 Fatema Shakir |
| 6 | T-015 | Review, test and commit: LangGraph agent state, plan validation/retry, prompts | 5 | Must | 5 | **M3 Fatema Shakir** | M1 Vishakha Sharma |
| 7 | T-016 | Review, test and commit: dependency graph builder and parallel executor | 5 | Must | 5 | **M1 Vishakha Sharma** | M2 Prajinraj Ranawat |
| 8 | T-032.1 | Automated tests: plan validation, graph builder, executor, Gemini fail-over (TC-U01, U02, U03, U05) | 5 | Must | 6 | **M2 Prajinraj Ranawat** | M3 Fatema Shakir |
| 9 | T-032.2 | Automated tests: sign-up/login, OAuth callbacks, agent 401 matrix (TC-U06, U07, U08) | 4 | Must | 6 | **M3 Fatema Shakir** | M1 Vishakha Sharma |
| 10 | T-032.3 | Automated tests: crypto, tool servers, chat renderer (TC-U04, U09, U10) | 4 | Must | 6 | **M1 Vishakha Sharma** | M2 Prajinraj Ranawat |
| 11 | T-034 | Consolidate branches into one authoritative `main` | 2 | Must | 5 | **M2 Prajinraj Ranawat** | M3 Fatema Shakir |
| 12 | T-033 | CI workflow (type-check, Python checks, tests) | 5 | Must | 6 | **M3 Fatema Shakir** | M1 Vishakha Sharma |
| 13 | T-035 | Encrypt connector OAuth tokens at rest | 8 | Must | 6 | **M1 Vishakha Sharma** | M2 Prajinraj Ranawat |
| 14 | T-017 | Review, test and commit: `github.update_repo`, Twilio recipient rule and trial-safe TwiML | 2 | Should | 5 | **M2 Prajinraj Ranawat** | M3 Fatema Shakir |
| 15 | T-018 | Review, test and commit: local Docker run configuration, localhost port binding | 1 | Should | 5 | **M3 Fatema Shakir** | M1 Vishakha Sharma |
| 16 | T-019 | Review and correct the database schema document | 1 | Should | 5 | **M1 Vishakha Sharma** | M2 Prajinraj Ranawat |
| 17 | T-036 | Per-user Twilio connector | 8 | Should | 7 | **M2 Prajinraj Ranawat** | M3 Fatema Shakir |
| 18 | T-037 | Update the architecture document to the current design | 3 | Should | 7 | **M3 Fatema Shakir** | M1 Vishakha Sharma |
| 19 | T-038 | Permissioned sharing for workflow links | 3 | Should | 7 | **M1 Vishakha Sharma** | M2 Prajinraj Ranawat |
| 20 | T-040 | Update landing-page copy (providers, claims) | 1 | Should | 7 | **M2 Prajinraj Ranawat** | M3 Fatema Shakir |
| 21 | T-039 | Cross-provider plan-quality benchmark (fakes first; live runs only with explicit approval) | 5 | Could | 7 | **M3 Fatema Shakir** | M1 Vishakha Sharma |

Card IDs `T-011 … T-019` are the "Code Review" cards in [kanban-board](kanban-board.md) §2.2 (together they form umbrella card T-030). `T-032` is split into `T-032.1 … T-032.3`. `T-040` is new. `T-020` (this documentation package) is not in the rotation; its review is covered by §5.

## 4. Resulting balance

| Member | Cards owned | Cards reviewed | Story points owned [PROPOSED] |
|---|---|---|---|
| M1 Vishakha Sharma | 7 | 7 | 25 |
| M2 Prajinraj Ranawat | 7 | 7 | 24 |
| M3 Fatema Shakir | 7 | 7 | 26 |
| **Total** | 21 | 21 | **75** |

By sprint (see [sprint-plan](sprint-plan.md) Part B):

| Sprint | M1 | M2 | M3 | Total |
|---|---|---|---|---|
| Sprint 5 | 10 | 10 | 9 | 29 |
| Sprint 6 | 12 | 5 | 9 | 26 |
| Sprint 7 | 3 | 9 | 8 | 20 |

The totals are even over the whole plan; individual sprints are not (for example M1 carries more in Sprint 6). If that is a problem for a given sprint, use rule 4.

## 5. How contribution will be evidenced (so a report to the manager is true)

| Evidence | Practice |
|---|---|
| Authorship | Each member commits **under their own name and e-mail** (`git config user.name` / `user.email`). M3 needs a Git identity and repository access; until then M3 has **no** Git evidence |
| Review | Work goes through pull requests; the assigned reviewer approves. PR history is the review record |
| AI assistance | Commits made with AI help carry a trailer such as `Co-Authored-By: <assistant>`; the course's AI policy must be checked ([team-verification-checklist](team-verification-checklist.md) B3) |
| Flow | Board timestamps (Ready → In Progress → Done) per card, per [kanban-board](kanban-board.md) |
| Work outside Git | Design, research, testing and demo work are recorded as board cards with a short written note and a link to the artefact, so non-coding contributions count too |
| Spot-check | At each retrospective, each owner explains one of their cards to the others |

## 6. What the manager report can and cannot say [TEAM CONFIRMATION REQUIRED]

Verified today (see [team-contributions](team-contributions.md) and [agile-metrics](agile-metrics.md)):
- Git shows two identities: M1 and M2, with 11 unique changes each (April–August 2026). M3 has **no** commits.
- 66 changed files are uncommitted and were produced in an AI-assisted session.
- Any contribution by M3 before today that is not in Git (design, research, testing, documentation, meetings) **can** be reported, but only with the evidence listed in [team-verification-checklist](team-verification-checklist.md) A1/A4 and E1. If it happened, add it; if it did not, it should not be added.

Not supportable: presenting the pre-allocation work as having been shared equally, or assigning today's AI-assisted work to members who did not do it.

Related: [kanban-board](kanban-board.md) · [sprint-plan](sprint-plan.md) · [product-backlog](product-backlog.md)
