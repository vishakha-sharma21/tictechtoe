import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017'

async function getMongoClient() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, session_id, messages } = body

    if (!user_id || !session_id || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = await getMongoClient()
    const db = client.db('nexflow')
    const chats = db.collection('chats')

    // Find or create chat session
    const existingChat = await chats.findOne({ user_id, session_id })
    
    if (!existingChat) {
      // Create new chat session if it doesn't exist
      await chats.insertOne({
        user_id,
        session_id,
        title: messages[0]?.content?.substring(0, 50) + '...' || 'New Chat',
        query: messages[0]?.content || '',
        chat_history: [],
        react_flow: { nodes: [], edges: [] },
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      })
    }

    // Add messages to chat history
    const now = new Date()
    const messagesWithTimestamp = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp || now.toISOString()
    }))

    await chats.updateOne(
      { user_id, session_id },
      {
        $push: {
          chat_history: { $each: messagesWithTimestamp }
        } as any,
        $set: {
          updated_at: now
        }
      }
    )

    await client.close()

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('Error appending to chat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
