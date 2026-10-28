import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { listConnected } from '@/lib/integrations'

// Kept for the integrations slide-over. The user always comes from the session, never from the query string.
export async function GET() {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const connected = await listConnected(session.user.userId)
  // Gmail / Drive are served by the single "google" connector.
  if (connected.includes('google')) connected.push('gmail', 'google_drive')
  return NextResponse.json({ connected }, { headers: { 'Cache-Control': 'no-store' } })
}
