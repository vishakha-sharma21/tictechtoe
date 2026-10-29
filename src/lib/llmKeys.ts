import { getDb } from '@/lib/db'
import { encrypt } from '@/lib/crypto'

export type LlmProvider = 'openai' | 'anthropic' | 'groq' | 'openrouter' | 'gemini'
export const LLM_PROVIDERS: LlmProvider[] = ['openai', 'anthropic', 'groq', 'openrouter', 'gemini']

const FORMAT: Record<LlmProvider, RegExp> = {
  openai: /^sk-[A-Za-z0-9_\-]{20,}$/,
  anthropic: /^sk-ant-[A-Za-z0-9_\-]{20,}$/,
  groq: /^gsk_[A-Za-z0-9]{20,}$/,
  openrouter: /^sk-or-[A-Za-z0-9_\-]{20,}$/,
  // Google issues two formats: classic `AIza…` and the newer `AQ.…`
  gemini: /^(AIza[A-Za-z0-9_\-]{30,}|AQ\.[A-Za-z0-9_\-.]{20,})$/,
}

export const KEY_HINT: Record<LlmProvider, string> = {
  openai: 'OpenAI keys start with "sk-".',
  anthropic: 'Anthropic keys start with "sk-ant-".',
  groq: 'Groq keys start with "gsk_".',
  openrouter: 'OpenRouter keys start with "sk-or-".',
  gemini: 'Gemini keys start with "AIza" or "AQ." (create one at aistudio.google.com/apikey).',
}

// Endpoint that fails with 401 for a bad key. (OpenRouter's /models is public, so use /auth/key.)
const CHECK_URL: Record<LlmProvider, string> = {
  openai: 'https://api.openai.com/v1/models',
  anthropic: 'https://api.anthropic.com/v1/models',
  groq: 'https://api.groq.com/openai/v1/models',
  openrouter: 'https://openrouter.ai/api/v1/auth/key',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',
}

export function looksLikeKey(provider: LlmProvider, key: string) {
  return FORMAT[provider].test(key)
}

async function providerMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return String(body?.error?.message ?? body?.error ?? '').slice(0, 200)
  } catch {
    return ''
  }
}

/**
 * Live-check the key. 401 = definitely invalid. 403 usually means a *restricted* key that lacks the
 * "list models" permission, so we fall back to a 1-token completion before rejecting. Never logs the key.
 */
export async function validateKey(
  provider: LlmProvider,
  key: string
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const headers: Record<string, string> =
    provider === 'anthropic'
      ? { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
      : provider === 'gemini'
      ? { 'x-goog-api-key': key } // header, not ?key=, so the key never lands in URLs/logs
      : { Authorization: `Bearer ${key}` }
  const base = provider === 'openai' ? 'https://api.openai.com/v1' : 'https://api.anthropic.com/v1'
  try {
    const list = await fetch(CHECK_URL[provider], { headers })
    if (list.ok) return { ok: true }
    if (list.status === 429) return { ok: false, reason: 'Provider rate-limited the check — try again shortly.' }

    if (list.status === 403 && (provider === 'openai' || provider === 'anthropic')) {
      const probe =
        provider === 'openai'
          ? await fetch(`${base}/chat/completions`, {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
            })
          : await fetch(`${base}/messages`, {
              method: 'POST',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify({ model: 'claude-haiku-5-5', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
            })
      if (probe.ok || probe.status === 429) return { ok: true }
      const msg = await providerMessage(probe)
      return { ok: false, reason: msg ? `Provider says: ${msg}` : `Provider returned HTTP ${probe.status}.` }
    }

    const msg = await providerMessage(list)
    if (list.status === 401 || (provider === 'gemini' && list.status === 400)) return { ok: false, reason: msg ? `Provider says: ${msg}` : 'The provider rejected this key.' }
    return { ok: false, reason: msg ? `Provider says: ${msg}` : `Provider returned HTTP ${list.status}.` }
  } catch {
    return { ok: false, reason: 'Could not reach the provider to verify the key.' }
  }
}

export async function saveKey(userId: string, provider: LlmProvider, key: string) {
  const db = await getDb()
  const col = db.collection('llm_keys')
  const now = new Date()
  await col.updateMany({ user_id: userId }, { $set: { is_default: false } })
  await col.updateOne(
    { user_id: userId, provider },
    {
      $set: { key_enc: encrypt(key), last4: key.slice(-4), is_default: true, updated_at: now },
      $setOnInsert: { user_id: userId, provider, created_at: now },
    },
    { upsert: true }
  )
}

/** Make an already-saved key the active one. Returns false if the user has no key for that provider. */
export async function setDefaultKey(userId: string, provider: LlmProvider): Promise<boolean> {
  const db = await getDb()
  const col = db.collection('llm_keys')
  if (!(await col.findOne({ user_id: userId, provider }, { projection: { _id: 1 } }))) return false
  await col.updateMany({ user_id: userId }, { $set: { is_default: false } })
  await col.updateOne({ user_id: userId, provider }, { $set: { is_default: true, updated_at: new Date() } })
  return true
}

/** Masked view only — the encrypted key never leaves the server. */
export async function listKeys(userId: string) {
  const db = await getDb()
  const docs = await db
    .collection('llm_keys')
    .find({ user_id: userId }, { projection: { _id: 0, provider: 1, last4: 1, is_default: 1, updated_at: 1 } })
    .toArray()
  return docs
}

export async function deleteKey(userId: string, provider: LlmProvider) {
  const db = await getDb()
  const col = db.collection('llm_keys')
  await col.deleteOne({ user_id: userId, provider })
  // promote another key to default if we removed the default one
  const remaining = await col.find({ user_id: userId }).toArray()
  if (remaining.length && !remaining.some((k) => k.is_default)) {
    await col.updateOne({ _id: remaining[0]._id }, { $set: { is_default: true } })
  }
}
