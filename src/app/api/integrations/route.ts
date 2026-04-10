import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { MongoClient } from 'mongodb'

// MongoDB connection
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

let cachedClient: MongoClient | null = null

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient
  }

  const client = new MongoClient(process.env.MONGODB_URI!)
  await client.connect()
  cachedClient = client
  return client
}

// Get user integrations (for MCP usage)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider') || 'google'

    const client = await connectToDatabase()
    const db = client.db('dagent')

    const integration = await db.collection('integrations').findOne({
      user_id: session.user.email,
      provider: provider
    })

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error('Get integration error:', error)
    return NextResponse.json(
      { error: 'Failed to get integration' },
      { status: 500 }
    )
  }
}
