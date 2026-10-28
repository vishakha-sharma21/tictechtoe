import { getDb } from '@/lib/db'

// One document per user: { user_id, providers: [{ provider, credentials, meta, connected_at }] }
// The Python MCP servers read this same shape.
export async function saveIntegration(
  userId: string,
  provider: string,
  credentials: Record<string, unknown>,
  meta: Record<string, unknown>
) {
  const db = await getDb()
  const col = db.collection('integrations')
  const now = new Date()
  const entry = { provider, credentials, meta, connected_at: now }

  await col.updateOne(
    { user_id: userId },
    { $setOnInsert: { user_id: userId, created_at: now, providers: [] } },
    { upsert: true }
  )
  const updated = await col.updateOne(
    { user_id: userId, 'providers.provider': provider },
    { $set: { 'providers.$': entry, updated_at: now } }
  )
  if (updated.matchedCount === 0) {
    await col.updateOne({ user_id: userId }, { $push: { providers: entry } as any, $set: { updated_at: now } })
  }
}

export async function listConnected(userId: string): Promise<string[]> {
  const db = await getDb()
  const doc = await db.collection('integrations').findOne({ user_id: userId })
  const providers: any[] = Array.isArray(doc?.providers) ? doc!.providers : []
  return providers.filter((p) => p?.credentials?.access_token).map((p) => p.provider)
}

export async function removeIntegration(userId: string, provider: string) {
  const db = await getDb()
  await db
    .collection('integrations')
    .updateOne({ user_id: userId }, { $pull: { providers: { provider } } as any, $set: { updated_at: new Date() } })
}
