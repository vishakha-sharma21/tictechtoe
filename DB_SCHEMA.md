# Database schema

MongoDB, database name from `MONGODB_DB` (default `nexflow`). Both the Next.js app and the Python backend use the same DB.
Indexes marked ★ are created automatically by `src/lib/db.ts` on first use.

## `users`
| field | type | notes |
|---|---|---|
| `_id` | ObjectId | **this is the app-wide `userId`** (string form) — in the session JWT, `chats.user_id`, `integrations.user_id`, `llm_keys.user_id` |
| `email` | string | lowercased, ★ unique |
| `name` | string | |
| `image` | string? | from Google |
| `password_hash` | string \| null | bcrypt (cost 12). `null` for Google-only accounts |
| `auth_providers` | string[] | `credentials`, `google` |
| `created_at`, `updated_at` | Date | |

## `llm_keys` — the user's own LLM key
| field | type | notes |
|---|---|---|
| `user_id` | string | ★ unique together with `provider` |
| `provider` | `"openai"` \| `"anthropic"` \| `"groq"` \| `"openrouter"` \| `"gemini"` | Groq / OpenRouter use the OpenAI wire format (see `mcp_agent/app/services/llm.py`) |
| `key_enc` | string | `enc:v1:<iv>:<tag>:<ct>` AES-256-GCM using `ENCRYPTION_KEY`. Never returned to the browser |
| `last4` | string | for display (`••••1234`) |
| `is_default` | bool | the key the backend uses; latest saved wins |
| `created_at`, `updated_at` | Date | |

## `integrations` — connector OAuth tokens (one doc per user)
| field | type | notes |
|---|---|---|
| `user_id` | string | ★ unique |
| `providers[]` | array | one entry per connector: `{ provider: "github"\|"google"\|"discord", credentials, meta, connected_at }` |
| `providers[].credentials` | object | `access_token`, `refresh_token`, `expires_at`, `token_type`, `scope[]` |
| `providers[].meta` | object | `provider_account_id`, `email`, `name`/`username`, … |
| `created_at`, `updated_at` | Date | |

> ⚠️ `credentials` are currently **plaintext** at rest — the Python MCP servers read them directly. See "Known gaps".

## `chats` (Mongoose model `Chat`)
`user_id`, `session_id` (`s001`…), `title`, `query`, `chat_history[{role: human|agent, content, timestamp}]`,
`react_flow{nodes[], edges[]}`, `execution_log[]`, `completed`, `created_at`, `updated_at`.
Index: `{user_id, created_at}`, `{user_id, session_id}`.

## `checkpoints`, `checkpoint_writes` — LangGraph agent memory
Written by `langgraph-checkpoint-mongodb` (`mcp_agent/app/services/agent_graph.py`). One thread per chat, `thread_id = "<user_id>:<session_id>"`.
State per thread: bounded `messages` (last 10, plans stored compactly), the current `plan`, detected/missing tools.
Auto-expires after 7 days (TTL) and is deleted when a workflow finishes successfully. Contains conversation text, not credentials.

## `sessions` (legacy Mongoose model `Session`)
Older per-workflow store keyed on `user_id = email`; only used by `/api/session/*`. The dashboard uses `chats`.

## Security model
- Browser ⇄ Next.js: NextAuth JWT session in an httpOnly cookie.
- Browser → Python: `Authorization: Bearer <10-min JWT>` from `GET /api/backend-token`. Python takes the user id **only** from the token `sub`.
- OAuth connectors: `state` is a signed 10-min JWT bound to the logged-in user + an httpOnly nonce cookie.
- Secrets shared by `.env.local` and `mcp_agent/.env`: `ENCRYPTION_KEY`, `BACKEND_JWT_SECRET` (must match).

## Known gaps
1. Connector tokens in `integrations` are not encrypted yet (needs a decrypt helper in each MCP server image).
2. The MCP servers (8020–8050) have no auth of their own; they are bound to `127.0.0.1` / the docker network only.
3. Rate limiting is in-memory (per instance).
