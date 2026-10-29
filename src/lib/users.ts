import bcrypt from 'bcryptjs'
import { getDb } from '@/lib/db'

export interface UserDoc {
  _id: unknown
  email: string
  name: string
  image?: string | null
  password_hash?: string | null
  auth_providers: string[]
  created_at: Date
  updated_at: Date
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export async function findUserByEmail(email: string) {
  const db = await getDb()
  return db.collection<UserDoc>('users').findOne({ email: normalizeEmail(email) })
}

export async function createCredentialsUser(name: string, email: string, password: string) {
  const db = await getDb()
  const now = new Date()
  const doc = {
    email: normalizeEmail(email),
    name: name.trim(),
    password_hash: await bcrypt.hash(password, 12),
    auth_providers: ['credentials'],
    created_at: now,
    updated_at: now,
  }
  const res = await db.collection('users').insertOne(doc) // unique index rejects duplicates
  return { id: res.insertedId.toString(), email: doc.email, name: doc.name }
}

/** Google sign-in: link to an existing account with the same (Google-verified) email, or create one. */
export async function upsertGoogleUser(email: string, name: string, image?: string | null) {
  const db = await getDb()
  const now = new Date()
  const res = await db.collection<UserDoc>('users').findOneAndUpdate(
    { email: normalizeEmail(email) },
    {
      $set: { updated_at: now, ...(image ? { image } : {}) },
      $addToSet: { auth_providers: 'google' },
      $setOnInsert: { email: normalizeEmail(email), name, password_hash: null, created_at: now },
    },
    { upsert: true, returnDocument: 'after' }
  )
  return { id: String(res!._id), email: res!.email, name: res!.name }
}

export async function verifyPassword(email: string, password: string) {
  const user = await findUserByEmail(email)
  // Always run a bcrypt compare so timing doesn't reveal whether the account exists.
  const hash = user?.password_hash || '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu'
  const ok = await bcrypt.compare(password, hash)
  if (!user || !user.password_hash || !ok) return null
  return { id: String(user._id), email: user.email, name: user.name }
}
