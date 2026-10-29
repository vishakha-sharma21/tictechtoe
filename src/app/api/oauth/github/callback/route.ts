import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import { verifyOAuthState } from '@/lib/oauthState'
import { saveIntegration } from '@/lib/integrations'

export async function GET(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  const fail = (code: string) => NextResponse.redirect(`${base}/dashboard?error=${code}`)

  const session = await auth()
  if (!session?.user?.userId) return NextResponse.redirect(`${base}/auth`)
  const userId = session.user.userId

  const code = request.nextUrl.searchParams.get('code')
  const state = verifyOAuthState('github', request.nextUrl.searchParams.get('state'), userId)
  if (!code || !state) return fail('github_invalid_state')

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI,
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) return fail('github_token_failed')

  const gh = (path: string) =>
    fetch(`https://api.github.com${path}`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: 'application/vnd.github+json' },
    })

  const githubUser = await (await gh('/user')).json()
  let email: string | null = githubUser.email ?? null
  if (!email) {
    const emails = await (await gh('/user/emails')).json()
    email = Array.isArray(emails) ? emails.find((e: any) => e.primary && e.verified)?.email ?? null : null
  }

  await saveIntegration(
    userId,
    'github',
    {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      expires_at: null,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope ? String(tokenData.scope).split(/[,\s]+/).filter(Boolean) : [],
    },
    { provider_account_id: String(githubUser.id), email, name: githubUser.name || githubUser.login }
  )

  const sid = state.sid ? `&session_id=${encodeURIComponent(state.sid)}` : ''
  return NextResponse.redirect(`${base}/dashboard?reconnect=true${sid}`)
}
