import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { MongoClient } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const userId = request.nextUrl.searchParams.get('user_id')

    if (!session?.user?.userId || !userId || session.user.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    const db = client.db('nexflow')
    const doc = await db.collection('integrations').findOne({ user_id: userId })
    await client.close()

    if (!doc) {
      return NextResponse.json({ connected: [] })
    }

    const providers = Array.isArray(doc.providers) ? doc.providers : []
    const connected: string[] = []
    for (const p of providers) {
      if (
        p &&
        typeof p === 'object' &&
        typeof (p as { provider?: string }).provider === 'string' &&
        (p as { credentials?: { access_token?: string } }).credentials?.access_token
      ) {
        connected.push((p as { provider: string }).provider)
      }
    }

    return NextResponse.json({ connected })
  } catch (e) {
    console.error('integrations/status', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
