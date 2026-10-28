import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { rateLimit } from '@/lib/rateLimit'
import { KEY_HINT, LLM_PROVIDERS, LlmProvider, deleteKey, listKeys, looksLikeKey, saveKey, setDefaultKey, validateKey } from '@/lib/llmKeys'

const noStore = { 'Cache-Control': 'no-store' }

export async function GET() {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const keys = await listKeys(session.user.userId)
  return NextResponse.json({ keys, hasKey: keys.length > 0 }, { headers: noStore })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.userId

  if (!rateLimit(`llmkey:${userId}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const provider = body?.provider as LlmProvider
  const apiKey = String(body?.apiKey ?? '').trim()

  if (!LLM_PROVIDERS.includes(provider)) return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  if (!looksLikeKey(provider, apiKey)) return NextResponse.json({ error: KEY_HINT[provider] }, { status: 400 })

  const check = await validateKey(provider, apiKey)
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 })

  await saveKey(userId, provider, apiKey)
  return NextResponse.json({ ok: true, keys: await listKeys(userId) }, { headers: noStore })
}

// Switch the active provider between keys that are already saved (no key needs to be re-entered).
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => null)
  const provider = body?.provider as LlmProvider
  if (!LLM_PROVIDERS.includes(provider)) return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  if (!(await setDefaultKey(session.user.userId, provider))) {
    return NextResponse.json({ error: 'No saved key for that provider' }, { status: 404 })
  }
  return NextResponse.json({ ok: true, keys: await listKeys(session.user.userId) }, { headers: noStore })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const provider = req.nextUrl.searchParams.get('provider') as LlmProvider
  if (!LLM_PROVIDERS.includes(provider)) return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
  await deleteKey(session.user.userId, provider)
  return NextResponse.json({ ok: true, keys: await listKeys(session.user.userId) }, { headers: noStore })
}
