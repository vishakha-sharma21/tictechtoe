import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { getDb } from '@/lib/db'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user_id = session.user.userId // never trust a user_id from the body

  try {
    const { session_id, messages } = await request.json()
    if (typeof session_id !== 'string' || !Array.isArray(messages) || messages.length > 20) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const now = new Date()
    const clean = messages.map((m: any) => ({
      role: m?.role === 'human' ? 'human' : 'agent',
      content: String(m?.content ?? '').slice(0, 20000),
      timestamp: now.toISOString(),
    }))

    const db = await getDb()
    await db.collection('chats').updateOne(
      { user_id, session_id },
      {
        $push: { chat_history: { $each: clean } } as any,
        $set: { updated_at: now },
        $setOnInsert: {
          title: (clean[0]?.content ?? 'New Chat').substring(0, 50),
          query: clean[0]?.content ?? '',
          react_flow: { nodes: [], edges: [] },
          completed: false,
          created_at: now,
        },
      },
      { upsert: true }
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error appending to chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
