import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Chat } from '@/lib/models/Chat'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const userId = session.user.userId

    // Get all chats for the user, sorted by created_at DESC
    const chats = await Chat.find({ user_id: userId })
      .sort({ created_at: -1 })
      .select('_id session_id title completed created_at updated_at query')
      .lean()

    // Truncate query to first 60 characters
    const formattedChats = chats.map(chat => ({
      ...chat,
      query: chat.query ? chat.query.substring(0, 60) + (chat.query.length > 60 ? '...' : '') : ''
    }))

    return NextResponse.json({ chats: formattedChats })

  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
