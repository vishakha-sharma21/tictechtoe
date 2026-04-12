import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'

// Sync user data to Python backend after OAuth sign-in
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email || !session?.user?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { accessToken, refreshToken, expiresAt, scope, tokenType } = body

    const userId = session.user.userId

    // Initialize user document in Python backend
    const initResponse = await fetch('http://localhost:8010/integrations/init', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        email: session.user.email
      })
    })

    if (!initResponse.ok) {
      console.error('Failed to initialize user:', await initResponse.text())
    }

    // Store Google integration data with OAuth credentials
    if (accessToken) {
      const upsertResponse = await fetch('http://localhost:8010/integrations/upsert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          provider: 'google',
          credentials: {
            access_token: accessToken,
            refresh_token: refreshToken || null,
            expires_at: expiresAt || null,
            token_type: tokenType || 'bearer',
            scope: scope ? scope.split(' ') : []
          },
          meta: {
            provider_account_id: session.user.email, // Using email as provider account ID for Google
            email: session.user.email,
            name: session.user.name || ''
          }
        })
      })

      if (!upsertResponse.ok) {
        console.error('Failed to sync integration:', await upsertResponse.text())
        return NextResponse.json(
          { error: 'Failed to sync integration data' },
          { status: 500 }
        )
      }
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
