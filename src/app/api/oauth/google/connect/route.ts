import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { createOAuthState } from '@/lib/oauthState'

const GOOGLE_CONNECTOR_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/contacts.readonly',
]

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.redirect(new URL('/auth', request.url))
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.redirect(new URL('/dashboard?error=google_not_configured', request.url))
  }

  const sid = request.nextUrl.searchParams.get('session_id') ?? ''
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_CONNECTOR_SCOPES.join(' '),
    access_type: 'offline', // get a refresh token…
    prompt: 'consent', // …every time (Google only issues it on consent)
    include_granted_scopes: 'true',
    state: createOAuthState('google', session.user.userId, { sid }),
  })
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
}
