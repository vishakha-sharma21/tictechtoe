import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Chat } from '@/lib/models/Chat'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const userId = session.user.userId

    // Find and delete the chat (verify it belongs to the user)
    const deletedChat = await Chat.findOneAndDelete({
      _id: params.id,
      user_id: userId
    })

    if (!deletedChat) {
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Chat deleted successfully' })

  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate ID parameter
    const { id } = params
    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Invalid chat id' }, { status: 400 })
    }

    const chat = await Chat.findOne({
      _id: id,
      user_id: session.user.userId
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const userId = session.user.userId

    const body = await req.json()
    const { title, query, chat_history, react_flow, completed } = body

    // Build update object
    const updateData: any = { updated_at: new Date() }
    if (title !== undefined) updateData.title = title
    if (query !== undefined) updateData.query = query
    if (chat_history !== undefined) updateData.chat_history = chat_history
    if (react_flow !== undefined) updateData.react_flow = react_flow
    if (completed !== undefined) updateData.completed = completed

    // Update the chat (verify it belongs to the user)
    const updatedChat = await Chat.findOneAndUpdate(
      {
        _id: params.id,
        user_id: userId
      },
      { $set: updateData },
      { new: true }
    )

    if (!updatedChat) {
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ chat: updatedChat })

  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
