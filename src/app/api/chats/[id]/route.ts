import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Integration } from '@/lib/models/Integration'
import { Chat } from '@/lib/models/Chat'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    // Find the chat (verify it belongs to the user)
    const chat = await Chat.findOne({
      _id: params.id,
      user_id: userId
    })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ chat })

  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
