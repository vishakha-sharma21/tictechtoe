import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { verifyOAuthState } from '@/lib/oauthState'
import { saveIntegration } from '@/lib/integrations'

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin
  const fail = (code: string) => NextResponse.redirect(`${base}/dashboard?error=${code}`)

  const session = await auth()
  if (!session?.user?.userId) return NextResponse.redirect(`${base}/auth`)
  const userId = session.user.userId

  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  if (!code || !verifyOAuthState('discord', searchParams.get('state'), userId)) return fail('discord_invalid_state')

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    }),
  })
  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) return fail('discord_token_failed')

  const headers = { Authorization: `Bearer ${tokenData.access_token}` }
  const discordUser = await (await fetch('https://discord.com/api/v10/users/@me', { headers })).json()
  const guilds = await (await fetch('https://discord.com/api/v10/users/@me/guilds', { headers })).json()

  await saveIntegration(
    userId,
    'discord',
    {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at: Date.now() + (tokenData.expires_in ?? 604800) * 1000,
      token_type: tokenData.token_type ?? 'Bearer',
      scope: tokenData.scope ? String(tokenData.scope).split(' ') : [],
    },
    {
      provider_account_id: discordUser.id,
      username: discordUser.username,
      email: discordUser.email,
      avatar: discordUser.avatar,
      guild_id: searchParams.get('guild_id'),
      guilds: Array.isArray(guilds) ? guilds.map((g: any) => ({ id: g.id, name: g.name })) : [],
    }
  )
  return NextResponse.redirect(`${base}/dashboard?discord=connected`)
}
