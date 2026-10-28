import jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

// Signed, short-lived OAuth `state` bound to the logged-in user and to a nonce cookie (CSRF protection).
const secret = () => {
  const s = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!s) throw new Error('AUTH_SECRET not set')
  return s
}

export function createOAuthState(provider: string, userId: string, extra: Record<string, string> = {}) {
  const nonce = randomBytes(16).toString('hex')
  const state = jwt.sign({ p: provider, uid: userId, n: nonce, ...extra }, secret(), { expiresIn: '10m' })
  cookies().set(`oauth_${provider}`, nonce, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  })
  return state
}

/** Returns the state payload if valid AND it was issued to `userId`; otherwise null. */
export function verifyOAuthState(provider: string, state: string | null, userId: string) {
  if (!state) return null
  try {
    const p = jwt.verify(state, secret()) as { p: string; uid: string; n: string; sid?: string }
    const nonce = cookies().get(`oauth_${provider}`)?.value
    cookies().delete(`oauth_${provider}`)
    if (p.p !== provider || p.uid !== userId || !nonce || nonce !== p.n) return null
    return p
  } catch {
    return null
  }
}
