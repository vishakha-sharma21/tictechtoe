import { NextRequest, NextResponse } from 'next/server'
import { createCredentialsUser, findUserByEmail } from '@/lib/users'
import { clientIp, rateLimit } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  if (!rateLimit(`signup:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ message: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 })
  }

  const name = String(body?.name ?? '').trim()
  const email = String(body?.email ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')

  if (name.length < 2 || name.length > 80) return NextResponse.json({ message: 'Name must be 2–80 characters' }, { status: 400 })
  if (!EMAIL_RE.test(email) || email.length > 254) return NextResponse.json({ message: 'Enter a valid email address' }, { status: 400 })
  if (password.length < 8 || password.length > 128) return NextResponse.json({ message: 'Password must be 8–128 characters' }, { status: 400 })

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json({ message: 'An account with this email already exists. Try signing in.' }, { status: 409 })
    }
    const user = await createCredentialsUser(name, email, password)
    return NextResponse.json({ ok: true, user }, { status: 201 })
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ message: 'An account with this email already exists. Try signing in.' }, { status: 409 })
    }
    console.error('signup error', e?.message)
    return NextResponse.json({ message: 'Could not create account' }, { status: 500 })
  }
}
