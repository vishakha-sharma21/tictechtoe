# Testing and Quality Assurance

> **Headline finding [VERIFIED]:** the repository contains **no automated tests** (0 test files from `git ls-files`), **no test runner configuration** (`package.json` scripts are `dev`, `build`, `start`, `lint` only), and **no CI** (no `.github/` directory). A root-level `test.py` appeared in the first commit and is listed in `.gitignore`; it is not tracked at `HEAD`.
>
> Statuses used below: **EXECUTED (static)** — run by the documentarian on 2026-10-28 with command and result recorded here; **EXECUTED (ad hoc)** — run once during the 2026-10-28 AI-assisted session, outcome observed in that session, **no script or log kept in the repository**; **NOT EXECUTED** — no evidence. Ad-hoc results are weaker evidence than a repeatable test and are labelled [PARTIALLY VERIFIED].

## 1. Test strategy found, by category

| Category | Present? | Evidence |
|---|---|---|
| Unit testing | No | no test files |
| Integration testing | No | no test files |
| API testing | No (ad hoc `curl` checks only, not saved) | — |
| Frontend / component testing | No | no Jest/Vitest/Testing Library in `package.json` |
| End-to-end testing | No | no Playwright/Cypress config |
| Security testing | Ad hoc only (see TC-S*) | — |
| Performance testing | None | — |
| Regression testing | None; e.g. the ReactFlow crash fix (`d078b21`) has no regression test | — |
| Manual testing | Likely but unrecorded | [TEAM CONFIRMATION REQUIRED] |
| CI/CD checks | None | no workflow files |
| Static analysis | TypeScript compiler available; `next lint` script defined but no ESLint config was found | `tsconfig.json`, `package.json` |

## 2. Static checks executed

| Test ID | Feature | Test type | Scenario | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|---|
| TC-SC01 | All TS/TSX | Static (type check) | `npx tsc --noEmit` at repo root | No type errors | Exit code 0, no output | **PASS (static)** | Run 2026-10-28; reproducible with the same command |
| TC-SC02 | All Python | Static (syntax) | `ast.parse` on every `.py` under `mcp_agent/` (excluding `.venv`) | No syntax errors | 19 files parsed, 0 errors | **PASS (static)** | Run 2026-10-28 |

These show only that the code compiles/parses. They are **not** evidence that features work.

## 3. Testing matrix

Feature IDs refer to [project-overview](project-overview.md). "Ad hoc" rows are [PARTIALLY VERIFIED]: the result was observed in the session, but nothing in the repository reproduces it.

| Test ID | Feature | Test type | Scenario | Expected result | Actual result | Status | Evidence |
|---|---|---|---|---|---|---|---|
| TC-A01 | F-02 | API | Sign up with a valid new user | 201 and user created | 201 returned | EXECUTED (ad hoc) | session |
| TC-A02 | F-02 | API | Sign up again with the same email | 409 | 409 returned | EXECUTED (ad hoc) | session |
| TC-A03 | F-02 | API | Sign up with a 5-character password | 400 | 400 returned | EXECUTED (ad hoc) | session |
| TC-A04 | F-02 | API | Log in with wrong password / right password | Rejected / session created | Rejected / session created | EXECUTED (ad hoc) | session |
| TC-A05 | F-02, F-12 | API | Call protected routes without a session | 401 | 401 for `/api/llm-keys`, `/api/backend-token`, `/api/integrations`, `/api/chats` | EXECUTED (ad hoc) | session |
| TC-S01 | F-12 | Security | Agent call without token / forged token / expired token | 401 | 401, 401, 401 | EXECUTED (ad hoc) | session |
| TC-S02 | F-12 | Security | Previously open endpoints and docs | 404 | `/integrations/upsert` and `/docs` returned 404 | EXECUTED (ad hoc) | session |
| TC-S03 | F-12 | Security | Stored data inspection | Password hashed, LLM key encrypted | bcrypt hash; `enc:v1:` ciphertext; no plaintext | EXECUTED (ad hoc) | session |
| TC-S04 | F-12 | Security | TypeScript↔Python AES-GCM interoperability | Each side decrypts the other's output | Both directions succeeded | EXECUTED (ad hoc) | session |
| TC-S05 | F-12 | Security | Tool servers' network exposure | Reachable on localhost only | Ports published on `127.0.0.1` in `docker-compose.yml` | **Config verified (static)**; reachability from other hosts NOT EXECUTED | `docker-compose.yml` |
| TC-S06 | F-12 | Security | Run-time rate limiting | Excess attempts rejected | **NOT EXECUTED** | NOT EXECUTED | — |
| TC-O01 | F-07 | Security | OAuth callback with forged state | Redirect to error | Redirected to `?error=…_invalid_state` | EXECUTED (ad hoc) | session |
| TC-O02 | F-07 | Security | Callback with a valid state issued to a different user | Rejected | Rejected | EXECUTED (ad hoc) | session |
| TC-O03 | F-07 | E2E | Complete GitHub/Google/Discord consent in a browser | Tokens saved, provider shown connected | A Google connection with refresh token existed afterwards; GitHub and Discord end-to-end **not observed** | PARTIALLY EXECUTED | database inspection in session |
| TC-K01 | F-11 | API | Key with wrong format | 400 with hint | 400 | EXECUTED (ad hoc) | session |
| TC-K02 | F-11 | Integration | Well-formed but fake key, per provider | Provider rejects, message shown | Rejected by OpenAI, Anthropic, Groq, OpenRouter and Gemini live APIs with their own messages | EXECUTED (ad hoc) | session |
| TC-K03 | F-11 | API | Switch active key / unknown provider / logged out | Switch OK / 404 / 401 | Switch OK, backend followed; 404; 401 | EXECUTED (ad hoc) | session |
| TC-K04 | F-11 | Unit | Gemini model ranking on sample lists (stable over preview; ignore lite/image/tts) | Expected model chosen | Matched expectations | EXECUTED (ad hoc) | session |
| TC-K05 | F-11 | Unit | Bad-key response shaped like Gemini's (HTTP 400, list body) | Treated as a key error | Mapped to "key rejected" | EXECUTED (ad hoc, fake server) | session |
| TC-P01 | F-04 | Integration | Fake model returns invalid plans then a valid one | ≤2 retries, valid plan returned | 3 model calls, valid plan | EXECUTED (ad hoc, fake server) | session |
| TC-P02 | F-04 | Unit | Plan validation: unknown tool, missing param, placeholder value | Errors listed | Matched | EXECUTED (ad hoc) | session |
| TC-P03 | F-04 | Integration | Agent state: blocked when connector missing; remembers plan; edit request carries `CURRENT PLAN`; state cleared on reset | As described | Matched (fake model, local Mongo) | EXECUTED (ad hoc) | session |
| TC-P04 | F-04 | Quality | Plan quality with real models | Not defined | Observed in single runs only; **no benchmark** | NOT EXECUTED (as a test) | — |
| TC-G01 | F-05 | Unit | Flat 15-step plan with no dependencies | Layered graph with fan-out/join | 6 layers, 15 edges, widest layer 5 | EXECUTED (ad hoc) | session |
| TC-X01 | F-06 | Unit | Executor with stubbed tools: parallelism and failure isolation | Independent nodes in the same wave; dependents of a failure skipped | 6 waves; 5 dependents skipped | EXECUTED (ad hoc, stubs) | session |
| TC-X02 | F-06 | E2E | Real workflow (Gmail send + label) | Email sent, label applied | Container log showed a message id and label applied (user-run); log not kept | PARTIALLY VERIFIED | transient container log |
| TC-T01 | F-08 | Integration | Tool registered: `github.update_repo` | Endpoint present | Present in OpenAPI | EXECUTED (ad hoc) | session |
| TC-T02 | F-08 | API | Twilio call/SMS/WhatsApp without a recipient | Error, no call placed | Error returned | EXECUTED (ad hoc) | session |
| TC-T03 | F-08 | E2E | Each of the 56 tools against its real service | Documented behaviour | **NOT EXECUTED** (except the Gmail workflow above) | NOT EXECUTED | — |
| TC-D01 | F-13 | Smoke | `docker compose up -d --build`, then health endpoints | All 5 services up | All five responded | EXECUTED (ad hoc) | session |
| TC-D02 | F-13 | Deployment | Deploy to Railway | — | **NOT EXECUTED** | NOT EXECUTED | no records |
| TC-F01 | F-01, F-03, F-09, F-10 | Frontend / manual | Landing, dashboard, persistence, sharing | — | **NOT EXECUTED** | NOT EXECUTED | — |

### Proposed automated tests to write (feeds Sprint 6, see [sprint-plan](sprint-plan.md) and [work-allocation](work-allocation.md)) [PROPOSED]

| ID | Target | What it should assert |
|---|---|---|
| TC-U01 | `plan.validate_plan` | unknown tool, missing required param, placeholder, cycle → errors |
| TC-U02 | `plan.build_graph` | declared deps, `{node.field}` refs and implicit GitHub deps produce expected edges/layers; cycle breaking |
| TC-U03 | `executor.execute_dag` (stubbed `call_tool`) | waves, skip-on-failure, forced `user_id` |
| TC-U04 | `crypto` (TS and Python) | round trip; tamper detection |
| TC-U05 | `llm._gemini_candidates` and fail-over | ranking and skip-on-404/429/503 with fake clients |
| TC-U06 | `/api/auth/signup`, NextAuth credentials | status codes, hashing, rate limit |
| TC-U07 | `/api/oauth/*` callbacks | forged/foreign/expired state rejected |
| TC-U08 | Agent endpoints | 401 matrix; user taken only from token |
| TC-U09 | Twilio/GitHub tool servers with mocked SDKs | required-recipient rule; `update_repo` payloads |
| TC-U10 | Chat renderer | message with missing text does not crash |

## 4. Definition of Done (testing-related) [PROPOSED]

A card is Done only when: acceptance criteria are demonstrated; an automated test covers new behaviour (or a reviewed exception is recorded); `tsc --noEmit` and the Python checks pass in CI; no secrets appear in code, logs or screenshots; security impact (authentication, authorisation, data isolation, input validation) is reviewed; and documentation is updated. The full list is in [kanban-board](kanban-board.md) §1.4.

## 5. Coverage limitations

- Code coverage cannot be measured: there are no tests.
- All third-party behaviour (provider APIs, OAuth screens, telephony, quotas) was exercised only through single manual or ad-hoc runs. Free-tier quotas make repeatable live tests costly; use recorded fakes for CI and reserve live checks for explicit, user-approved runs.

Related: [agile-metrics](agile-metrics.md) · [challenges-and-risks](challenges-and-risks.md)
