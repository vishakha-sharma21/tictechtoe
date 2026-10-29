import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { createOAuthState } from '@/lib/oauthState'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.userId) return NextResponse.redirect(new URL('/auth', request.url))
  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_REDIRECT_URI) {
    return NextResponse.redirect(new URL('/dashboard?error=discord_not_configured', request.url))
  }

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify email guilds guilds.join bot',
    permissions: '8',
    state: createOAuthState('discord', session.user.userId),
  })
  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params}`)
}
