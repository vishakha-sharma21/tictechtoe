# Challenges, Blockers and Risks

> **Rules applied.** An issue appears in §1 only if repository evidence (Git history, committed code, current files) or a directly observed event supports it. A *root cause* is stated only where evidence supports it; otherwise it reads `Not established`. Items observed during the 2026-10-28 AI-assisted session but not recorded in the repository are marked **[PARTIALLY VERIFIED]** because their only record is the session itself. Unsupported possibilities are in §3 and §4, not §1.

## 1. Confirmed issues

| Issue ID | Description | Evidence | Impact | Root Cause | Resolution | Prevention | Verification Status |
|---|---|---|---|---|---|---|---|
| ISS-001 | Build output (`.next`, `__pycache__`) was committed | First commit `97d96b4` contains `.next/`; its `.gitignore` has no `next` entry; cleanup commits `6dd4781` (184 files, 13,569 deletions), `e1aba37`, `652afae` | Large noisy diffs; build-output file entries appear 588 times (M1) and 602 times (M2) in the authors' change lists (entries across commits, not distinct files) | `.gitignore` did not exclude `.next` at the first commit | M2 removed artefacts and extended `.gitignore` on 2026-04-12; `HEAD` tracks 0 build files | Pre-commit check; CI that fails on tracked build output | [VERIFIED] |
| ISS-002 | Cleanup commits removed and then partly restored files; commit message and diff disagree | `652afae` removed `.gitignore`, `DEPLOYMENT_GUIDE.md`, `.dockerignore`, caches; `e680aca` "restore all source files" changed only `.gitignore` and `railway.toml` | Deployment guide no longer tracked (it is listed in `.gitignore`); unclear what was intended | Not established | Files restored selectively | Review cleanup commits before pushing; small commits | [VERIFIED] (facts); intent [TEAM CONFIRMATION REQUIRED] |
| ISS-003 | Dashboard crashed with `TypeError: Cannot read properties of undefined (reading 'x')` when a DAG node had no position | Message of `d078b21` (261 files) | Plans failed to render | Model output sometimes omitted positions | Shared `sanitizeNodes` utility with fallback positions (M2) | Server-side normalisation now builds positions (working tree) | [VERIFIED] fix committed; no test |
| ISS-004 | Parallel, divergent copies of the same commits on `production` and `main`/`prajinraj` | 8 commit pairs (e.g. `13ca5da`/`97d96b4`, `5d647c6`/`9920198`) with same author/minute/subject; `git branch --contains` | Unclear which branch is authoritative; raw commit count (28) overstates changes (22 unique) | Not established | None found | Single `main`; branch policy (PB-024) | [VERIFIED]; cause [TEAM CONFIRMATION REQUIRED] |
| ISS-005 | Four web-UI commits to one file within 21 minutes, including removal then re-addition of 61 lines | `ab45fbf`, `ee8fea3`, `fe84282` (−61), `1a896bb` (+61) on `src/app/api/integrations/route.ts` | Churn; the reason for the change is not recorded | Not established | Final state equals the re-added version | Work on branches with PRs and meaningful messages | [VERIFIED] (facts) |
| ISS-006 | Inconsistent persistence structure and database naming | `5d647c6` message ("fix one-to-many relationship between user_id and providers", nested providers structure); committed code used `db('dagent')` in `integrations/route.ts` but `db('nexflow')` elsewhere; `mongoose.connect` used the URI default | Integrations stored/read from different places; status checks could miss data | Schema evolved without a single definition | Nested `providers[]` (committed); single `MONGODB_DB` and `getDb()` helper (working tree); `DB_SCHEMA.md` | Central schema document and helper | [VERIFIED] (committed code); working-tree fix [PARTIALLY VERIFIED] |
| ISS-007 | Security weaknesses in the committed code | `HEAD`: `src/app/api/integrations/upsert/route.ts` forwards any body with no `auth()` call; Python `query.py` models take `user_id` from the request body with no `Depends`; GitHub OAuth `state` is plain base64 (`connect/route.ts` line 17); `/api/chats/append` reads `user_id` from the body; `query.py` line 143 prints every user's chat keys | Any caller could overwrite another user's tokens or act as another user; forged OAuth callbacks possible | Authentication was added to the UI but not enforced on the API/backend | Signed JWT for the backend, signed OAuth state, removal of open endpoints, session-derived ids (working tree) | Security review as a Definition-of-Done item; tests for 401/403 | Weakness [VERIFIED]; fix [PARTIALLY VERIFIED] — uncommitted, ad-hoc checks only |
| ISS-008 | Third-party OAuth tokens stored in plaintext | Tool servers read `credentials.access_token` directly (`github_mcp/server.py` line 25 at `HEAD`; same in working tree) | A database leak exposes users' GitHub/Google/Discord tokens | Tool servers were written to read tokens as stored | **Unresolved** (LLM keys and passwords are protected; connector tokens are not) — PB-021 | Encrypt at rest with a shared helper | [VERIFIED] unresolved |
| ISS-009 | Provider rate and size limits blocked planning | Observed: Groq HTTP 413 (single request above the 8,000-token/minute cap) and 429; Gemini 429/503/404 per model | Users saw "Something went wrong" | Free-tier caps; large prompts (all tools + examples + resent history); retired or unavailable model names | Server-side state instead of resending history; leaner prompts; wait-and-retry; per-model fail-over for Gemini; clear error messages | Provider-specific limits documented; benchmark with fakes | [PARTIALLY VERIFIED] (session logs not retained) |
| ISS-010 | Connector detection hallucinated tools on short follow-ups ("yes if you can do that" → GitHub) | Observed in a chat transcript | User asked to connect an unrelated service | The small detector model only saw the latest message | Detector receives recent history and its output must be backed by keywords in the conversation | Test cases for follow-up turns | [PARTIALLY VERIFIED] |
| ISS-011 | External configuration blockers outside the code | Observed: Google "Access blocked: missing client_id" (empty OAuth variables); "Gmail API not enabled for project"; telephony trial account lacking a purchased/verified number and rejecting inline TwiML | Features unavailable until configured | Third-party setup steps (OAuth app, API enablement, account verification) | Documented steps; UI hides Google sign-in when unconfigured; trial-safe Twilio fallback; friendly error text with the enable link | Setup checklist in README | [PARTIALLY VERIFIED] |
| ISS-012 | Plans were sequential and so was execution | Prompt text and executor at `HEAD` instruct "each node must depend on previous nodes in sequence" and run nodes one by one | Slow, linear graphs | Design choice in the original orchestrator | Dependency graph builder and wave-parallel executor (working tree) | — | Change [VERIFIED] in code; behaviour [PARTIALLY VERIFIED] |
| ISS-013 | Login/sign-up UI called endpoints that did not exist | `src/lib/auth.ts` at `HEAD` posts to `/api/auth/login` and `/api/auth/signup`; neither route exists in the committed tree | Email/password sign-in could not work | Forms and API built separately | Routes and NextAuth credentials provider added (working tree) | End-to-end smoke test | [VERIFIED] |
| ISS-014 | Chat renderer crash when an agent reply had no text | Runtime error `Cannot read properties of undefined (reading 'startsWith')` in `ChatPanel.tsx` | Page crash | Validator did not require a `message` for plans | Server fills a default message; UI tolerates empty text | Component test | [PARTIALLY VERIFIED] |
| ISS-015 | Tool servers perform no caller authentication | Tool endpoints accept `user_id` in the body (`github_mcp`, `google_mcp`, `discord_mcp`, `twilio_mcp`) | Anyone who can reach the ports can act as any user | Services assumed a private network | Ports bound to `127.0.0.1`; agent forces `user_id` | Shared service token between agent and tools | [VERIFIED] unresolved (mitigated by network binding) |
| ISS-016 | Development testing consumed users' free-tier AI quota | Observed: live test calls were made with users' keys; the user reported quota exhaustion | Blocked the user's own use | Tests used real keys instead of fakes | Rule adopted: fakes only, ask first | Test doubles for providers | [PARTIALLY VERIFIED] |
| ISS-017 | Local process outside Docker could not reach tool servers by hostname | Observed `[Errno 8] nodename nor servname provided`; Compose uses container hostnames | Workflow steps failed | Backend started directly on the host | Run through `docker compose`; Mongo reached through the host gateway | Single documented run command | [PARTIALLY VERIFIED] |
| ISS-018 | Documentation out of date | `ARCHITECTURE_DOCUMENTATION.md` (2026-08-06) describes the pre-redesign system; landing copy says "GPT-4o plans your workflow" | Misleading for assessors and users | Documentation not updated with code | PB-025 | Documentation card per cycle | [VERIFIED] |

## 2. How the team responded (confirmed items only)

| Issue | Response | Effective? | Improvement for next project |
|---|---|---|---|
| ISS-001/002 | Same-day cleanup (M2) | Yes for build output; intent of ISS-002 unclear | Review `.gitignore` before the first commit |
| ISS-003 | Fix in the same session as the report | Yes (fix committed); no regression test | Add a test that renders a node without position |
| ISS-006/007/013 | Addressed in the uncommitted working tree | Not yet — unreviewed, uncommitted | Land via small reviewed PRs (T-030) |
| ISS-009/010/011/012/014/017 | Addressed during the AI-assisted session | Partially — evidence is transcript-only | Capture these as automated tests |
| ISS-004/005/008/015 | Not addressed | No | Backlog PB-024, PB-021, shared tool-server secret |

## 3. Potential risks (not confirmed incidents)

| ID | Risk | Likelihood / impact | Mitigation |
|---|---|---|---|
| R-001 | Review load concentrates on one person in a small team and makes Code Review a bottleneck | Medium / Medium | WIP limit; rotating reviewer ([work-allocation](work-allocation.md)); time-box reviews |
| R-002 | Unreviewed, uncommitted work (66 files) is lost or conflicts with `main` | Medium / High | Commit in small PRs now (T-030) |
| R-003 | Public share links expose any chat whose id is known | Low (ids are unguessable ObjectIds) / High | Permission flag (PB-023) |
| R-004 | In-memory rate limiting does not scale or survive restarts | Medium / Low | Shared store |
| R-005 | Provider API changes (model retirements, key formats) break planning | High / Medium | Preference lists and fail-over (done for Gemini); contract tests |
| R-006 | Credentials shared in chat or logs during development remain valid | Medium / High | Rotate (T-031) [TEAM CONFIRMATION REQUIRED] |
| R-007 | Shared Twilio account lets any user incur cost or place calls | Medium / High | Per-user Twilio connector (PB-022) |
| R-008 | Plan quality with open models is unmeasured | High / Medium | Benchmark (PB-028) |

## 4. Potential Challenges to Validate With the Team

The repository contains **no evidence** for the following; they are listed so the team can confirm or dismiss them. They must not be presented as having occurred unless confirmed.

- Requirement ambiguity or scope disagreements between members.
- Merge conflicts (no merge commits exist in history).
- Uneven workload (12 unique changes on 2026-04-12 versus 2 on 2026-08-06).
- Delayed reviews, communication problems, time-pressure trade-offs.
- Test failures or deployment failures (no tests or deployments are recorded).
- Whether M3 (no Git identity) or anyone else contributed outside Git, and how.

Related: [team-verification-checklist](team-verification-checklist.md) · [retrospective](retrospective.md) · [testing-and-quality-assurance](testing-and-quality-assurance.md)
