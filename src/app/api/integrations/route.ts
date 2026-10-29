import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { listConnected, removeIntegration } from '@/lib/integrations'

// Connected provider names only — credentials never leave the server.
export async function GET() {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ connected: await listConnected(session.user.userId) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const provider = request.nextUrl.searchParams.get('provider')
  if (!provider || !['github', 'google', 'discord'].includes(provider)) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  }
  await removeIntegration(session.user.userId, provider)
  return NextResponse.json({ ok: true })
}
