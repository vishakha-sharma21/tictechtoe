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

// Sync user data to MongoDB after OAuth sign-in
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { accessToken, refreshToken, expiresAt, scope, tokenType } = body

    const client = await connectToDatabase()
    const db = client.db('dagent')
    const now = new Date()

    // Store user data
    await db.collection('users').replaceOne(
      { _id: session.user.email } as any,
      { 
        _id: session.user.email,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        created_at: now,
        updated_at: now
      },
      { upsert: true }
    )

    // Store integration data with OAuth credentials
    if (accessToken) {
      await db.collection('integrations').replaceOne(
        { user_id: session.user.email, provider: 'google' },
        { 
          user_id: session.user.email,
          provider: 'google',
          credentials: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_at: expiresAt,
            scope: scope,
            token_type: tokenType
          },
          meta: {
            email: session.user.email,
            name: session.user.name || undefined
          },
          created_at: now,
          updated_at: now
        },
        { upsert: true }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Auth sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync user data' },
      { status: 500 }
    )
  }
}
