import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectDB } from '@/lib/connectDB'
import { Chat } from '@/lib/models/Chat'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    await connectDB()

    const chat = await Chat.findById(id).select('title react_flow created_at').lean()

    if (!chat) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({
      title: chat.title,
      react_flow: chat.react_flow ?? { nodes: [], edges: [] },
      created_at: chat.created_at,
    })
  } catch (e) {
    console.error('chats/public', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
