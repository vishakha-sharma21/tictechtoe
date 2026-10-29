import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { signBackendToken } from '@/lib/backendToken'

// Browser fetches this, then sends it as `Authorization: Bearer` to the Python backend.
export async function GET() {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ token: signBackendToken(session.user.userId) }, { headers: { 'Cache-Control': 'no-store' } })
}
