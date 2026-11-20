# Retrospective and Lessons Learned

> **Status: Proposed Retrospective Based on Repository Analysis.** No retrospective meeting is evidenced, and none is invented here. Nothing below is attributed to a team member, and no consensus is claimed. Findings are split into **evidence-based** (§1) and **hypotheses for the team to confirm or reject** (§2).

## 1. Evidence-based findings

### What went well
| # | Finding | Evidence |
|---|---|---|
| W1 | A working end-to-end product (UI, backend, tool servers, containers) was assembled in ≈43 hours of calendar time | Commits 2026-04-10 → 04-12; 56 tools in four services |
| W2 | Clear division of work between frontend (M1) and backend (M2) streams | Author/path analysis ([team-contributions](team-contributions.md)) |
| W3 | Problems were fixed quickly after introduction (ReactFlow crash fixed ≈22 hours after the orchestrator feature; build artefacts cleaned up the same morning as the Railway config) | `941b6c6` (04-11 08:16) → `d078b21` (04-12 06:28); `208ca19`/`6dd4781` (04-12 06:38/06:43) |
| W4 | Commit messages for the substantive changes describe what changed and why | `5d647c6`, `941b6c6`, `d078b21`, `208ca19` |
| W5 | Services are containerised and separated by provider, which made later changes local | `docker-compose.yml`, per-provider folders |
| W6 | Existing design documentation shows a habit of recording architecture | `ARCHITECTURE_DOCUMENTATION.md` |

### What did not go well
| # | Finding | Evidence |
|---|---|---|
| N1 | No automated tests, no CI, no review records | 0 test files; no `.github/`; no merge commits |
| N2 | Security was added to the UI but not enforced on the APIs | ISS-007 |
| N3 | UI and API were built apart (forms calling non-existent routes) | ISS-013 |
| N4 | Build output was committed; cleanup commits are messy and one message does not match its diff | ISS-001, ISS-002 |
| N5 | Branch history is duplicated and divergent | ISS-004 |
| N6 | The process left no planning or reflection record | repository contains none |
| N7 | Documentation drifted from the code | ISS-018 |
| N8 | Substantial recent work is uncommitted and unreviewed | 66 entries in `git status` |
| N9 | Third-party tokens are stored unencrypted | ISS-008 |
| N10 | Live testing consumed a user's free-tier quota | ISS-016 |

### Continue / Stop / Start
| Category | Items |
|---|---|
| **Continue** | Descriptive commit messages for substantive changes · separating services by provider · containers for local runs · writing architecture documentation |
| **Stop** | Committing build output and caches · pushing the same change to multiple branches · making large multi-purpose commits (e.g. 261 files in one) · testing with real users' API keys |
| **Start** | Writing tests with each feature · CI on every push · pull requests with a reviewer from the other stream · an explicit board with WIP limits · a Definition of Done checklist · credential rotation after development sharing · recording decisions and meetings (even a short note) |

## 2. Hypotheses requiring team confirmation [TEAM CONFIRMATION REQUIRED]

| # | Hypothesis | Why it is only a hypothesis |
|---|---|---|
| H1 | The concentration of work on 2026-04-12 (12 unique changes) reflects a deadline | No deadline evidence |
| H2 | Reviews happened informally (chat, calls) | No record either way |
| H3 | The `production` branch was used for deployment while `main` was the shared branch | Branch names suggest it; purpose not recorded |
| H4 | The four route.ts commits reflect debugging through the GitHub web editor | Commit messages are identical; the reason is not recorded |
| H5 | M3 (Fatema Shakir, no Git identity) and others contributed outside Git | Only two identities appear in Git; the team lead states there are three members |
| H6 | The 2026-08-06 documentation work was for submission | Date only |

## 3. Improvement action register [PROPOSED]

Owners follow [work-allocation](work-allocation.md) where a card exists; the rest are TBC (*ownership requires confirmation from the project team*). Target dates are relative to the next planning checkpoint (CP) and are illustrative.

| Action ID | Improvement | Reason | Priority | Owner | Target Date | Success Measure | Status |
|---|---|---|---|---|---|---|---|
| A-01 | Review and commit the working tree in small PRs (T-030) | N8, R-002 | Must | per T-011…T-019 owners | CP + 1 week | `git status` clean; each PR reviewed by the non-author | Open |
| A-02 | Rotate credentials shared during development (T-031) | R-006 | Must | M1 Vishakha Sharma | CP + 1 day | Old secrets revoked; new ones in `.env` only | Open |
| A-03 | Add automated tests TC-U01…TC-U10 | N1 | Must | M2 / M3 / M1 (T-032.1 / .2 / .3) | CP + 2 weeks | Tests run locally and in CI; each acceptance criterion of PB-001/003/004/005 covered | Open |
| A-04 | Add CI workflow | N1 | Must | M3 Fatema Shakir (T-033) | CP + 2 weeks | Passing run on `main` | Open |
| A-05 | Consolidate to a single `main` | N5 | Must | M2 Prajinraj Ranawat (T-034) | CP + 1 week | One authoritative branch; policy documented | Open |
| A-06 | Encrypt connector tokens | N9 | Must | M1 Vishakha Sharma (T-035) | CP + 3 weeks | No plaintext tokens in `integrations` | Open |
| A-07 | Adopt the board, WIP limits and Definition of Done | N6 | Should | TBC | CP | Board in use; cycle time recorded for ≥10 cards | Open |
| A-08 | Update architecture and landing copy | N7 | Should | M3 (T-037), M2 (T-040) | CP + 3 weeks | Documents match code; reviewed | Open |
| A-09 | Replace real-key live tests with fakes | N10 | Should | owners of T-032.1–.3 | CP + 2 weeks | Test suite uses stub providers | Open |
| A-10 | Hold a real retrospective and replace this proposal with it | N6 | Should | TBC | next cycle | Dated record with participants' own statements | Open |

## 4. Lessons learned (evidence-based)

1. *Enforce authentication on the API, not only in the UI* — a login screen does not protect an unauthenticated endpoint (ISS-007).
2. *Connect UI and API early with one smoke test* — forms that call non-existent routes go unnoticed without it (ISS-013).
3. *Do not trust the model's structure* — validating and normalising model output server-side (plan validation, graph building) made behaviour predictable across providers (F-04, F-05).
4. *Provider facts change* — model names, key formats and quota rules differ per provider and over time; design for fail-over and clear errors (ISS-009).
5. *Keep experiments off real users' quotas* — use fakes by default (ISS-016).
6. *Record decisions while they are fresh* — most of the "why" in this project is unrecoverable ([team-verification-checklist](team-verification-checklist.md)).

## 5. Template for real retrospective records

| Field | Entry |
|---|---|
| Date / time-box | |
| Participants (who actually attended) | |
| Went well (their words) | |
| Did not go well (their words) | |
| Decisions / actions (owner, due date) | |
| Follow-up from previous retrospective | |

Related: [challenges-and-risks](challenges-and-risks.md) · [sprint-plan](sprint-plan.md) · [agile-metrics](agile-metrics.md)
