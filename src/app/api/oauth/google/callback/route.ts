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
  const state = verifyOAuthState('google', searchParams.get('state'), userId)
  if (!code || !state) return fail('google_invalid_state')

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
      code,
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) return fail('google_token_failed')

  const profile = await (
    await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
  ).json()

  await saveIntegration(
    userId,
    'google',
    {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at: Math.floor(Date.now() / 1000) + (tokenData.expires_in ?? 3600),
      token_type: tokenData.token_type ?? 'Bearer',
      scope: tokenData.scope ? String(tokenData.scope).split(' ') : [],
    },
    { provider_account_id: profile.sub, email: profile.email, name: profile.name }
  )

  const sid = state.sid ? `&session_id=${encodeURIComponent(state.sid)}` : ''
  return NextResponse.redirect(`${base}/dashboard?reconnect=true${sid}`)
}
