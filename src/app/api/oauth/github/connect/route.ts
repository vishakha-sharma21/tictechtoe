import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { createOAuthState } from '@/lib/oauthState'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.redirect(new URL('/auth', request.url))
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_REDIRECT_URI) {
    return NextResponse.redirect(new URL('/dashboard?error=github_not_configured', request.url))
  }

  const sid = request.nextUrl.searchParams.get('session_id') ?? ''
  const state = createOAuthState('github', session.user.userId, { sid })
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: 'repo delete_repo read:user user:email',
    state,
  })
  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
}
