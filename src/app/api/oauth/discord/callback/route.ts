import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=discord_oauth_failed', req.url))
  }

  // Exchange code for token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!
    })
  })

  const tokenData = await tokenRes.json()
  console.log('Discord token response:', tokenData)

  if (tokenData.error) {
    console.error('Discord token error:', tokenData)
    return NextResponse.redirect(new URL('/dashboard?error=discord_token_failed', req.url))
  }

  // Get Discord user info
  const userRes = await fetch('https://discord.com/api/v10/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  })
  const discordUser = await userRes.json()

  // Get guilds
  const guildsRes = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  })
  const guilds = await guildsRes.json()

  // Get session to find user email
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.redirect(new URL('/dashboard?error=no_session', req.url))
  }

  // Save to MongoDB via mcp_agent
  const saveRes = await fetch(`${process.env.MCP_AGENT_URL}/integrations/upsert-by-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: session.user.email,
      provider: 'discord',
      credentials: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token ?? null,
        expires_at: Date.now() + (tokenData.expires_in ?? 604800) * 1000,
        token_type: tokenData.token_type ?? 'Bearer',
        scope: tokenData.scope ? tokenData.scope.split(' ') : []
      },
      meta: {
        provider_account_id: discordUser.id,
        username: discordUser.username,
        email: discordUser.email,
        avatar: discordUser.avatar,
        guild_id: searchParams.get('guild_id'),
        guilds: Array.isArray(guilds) ? guilds.map((g: any) => ({ id: g.id, name: g.name })) : []
      }
    })
  })

  try {
    const saveData = await saveRes.json()
    console.log('Integration saved:', saveData)

    return NextResponse.redirect(new URL('/dashboard?discord=connected', req.url))
  } catch (err) {
    console.error('Discord callback error:', err)
    return NextResponse.redirect(new URL('/dashboard?error=discord_callback_failed', req.url))
  }
}
