import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Integration } from '@/lib/models/Integration'
import { Chat } from '@/lib/models/Chat'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    // Get user's integration to find user_id
    const integration = await Integration.findOne({ 'meta.email': session.user.email })
    if (!integration) {
      return NextResponse.json({ error: 'User integration not found' }, { status: 404 })
    }

    const userId = integration.user_id

    // Check for idempotency - if user created a chat in the last 2 seconds, return it
    const recentChat = await Chat.findOne({
      user_id: userId,
      created_at: { $gte: new Date(Date.now() - 2000) }
    }).sort({ created_at: -1 })

    if (recentChat) {
      return NextResponse.json({
        _id: recentChat._id,
        session_id: recentChat.session_id,
        message: 'Recent chat returned (idempotency)'
      })
    }

    // Get next session_id for this user
    const nextSessionId = await (Chat as any).getNextSessionId(userId)

    // Create new chat
    const newChat = await Chat.create({
      user_id: userId,
      session_id: nextSessionId,
      title: 'New workflow',
      query: '',
      chat_history: [],
      react_flow: { nodes: [], edges: [] },
      completed: false
    })

    return NextResponse.json({
      _id: newChat._id,
      session_id: newChat.session_id
    })

  } catch (error) {
    console.error('Error creating new chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
