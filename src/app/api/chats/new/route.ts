import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Chat } from '@/lib/models/Chat'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const userId = session.user.userId

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

    // Get next session_id for this user with duplicate protection
    let session_id: string | undefined
    let attempts = 0

    while (attempts < 10) {
      const candidate = `s${String(attempts + 1).padStart(3, '0')}`
      const exists = await Chat.findOne({ user_id: userId, session_id: candidate })
      if (!exists) {
        session_id = candidate
        break
      }
      attempts++
    }

    if (!session_id) {
      return NextResponse.json({ error: 'Unable to generate unique session ID' }, { status: 500 })
    }

    // Create new chat
    const newChat = await Chat.create({
      user_id: userId,
      session_id: session_id,
      title: 'New workflow',
      query: '',
      chat_history: [],
      react_flow: { nodes: [], edges: [] },
      completed: false
    })

    return NextResponse.json({
      _id: newChat._id.toString(),
      session_id: newChat.session_id
    })

  } catch (error) {
    console.error('Error creating new chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
