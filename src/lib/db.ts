import type { Db } from 'mongodb'
import { clientPromise } from '@/lib/mongodb'

export const DB_NAME = process.env.MONGODB_DB || 'nexflow'

let indexesReady: Promise<void> | null = null

export async function getDb(): Promise<Db> {
  const db = (await clientPromise).db(DB_NAME)
  if (!indexesReady) {
    indexesReady = ensureIndexes(db).catch((e) => {
      indexesReady = null
      throw e
    })
  }
  await indexesReady
  return db
}

async function ensureIndexes(db: Db) {
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('integrations').createIndex({ user_id: 1 }, { unique: true })
  await db.collection('llm_keys').createIndex({ user_id: 1, provider: 1 }, { unique: true })
}
