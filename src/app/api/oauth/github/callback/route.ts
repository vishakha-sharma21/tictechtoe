import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return new NextResponse("Missing code or state", { status: 400 })
  }

  // Step 1 — Decode state
  const { user_id, session_id } = JSON.parse(
    Buffer.from(state, "base64").toString()
  )
  console.log("GitHub callback for user:", user_id, "session:", session_id)

  // Step 2 — Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    })
  })
  const tokenData = await tokenRes.json()
  console.log("Token response:", tokenData)

  const { access_token, scope, token_type } = tokenData

  if (!access_token) {
    return new NextResponse("Failed to get access token from GitHub", { status: 500 })
  }

  // Step 3 — Fetch GitHub user profile
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      "Authorization": `Bearer ${access_token}`,
      "Accept": "application/vnd.github+json"
    }
  })
  const githubUser = await userRes.json()
  console.log("GitHub user:", githubUser.login, githubUser.id)

  // Step 4 — Get email if not public
  let email = githubUser.email
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { "Authorization": `Bearer ${access_token}` }
    })
    const emails = await emailsRes.json()
    const primary = emails.find((e: any) => e.primary && e.verified)
    email = primary?.email || null
  }

  // Step 5 — Save to MongoDB via Python backend
  const integrationDoc = {
    user_id: user_id,
    provider: "github",
    credentials: {
      access_token: access_token,
      refresh_token: null,
      expires_at: null,
      token_type: token_type || "bearer",
      scope: scope ? scope.split(",").map((s: string) => s.trim()) : ["repo", "read:user", "user:email"]
    },
    meta: {
      provider_account_id: String(githubUser.id),
      email: email,
      name: githubUser.name || githubUser.login
    }
  }

  // Check if GitHub integration already exists to prevent duplicates
  const existingCheck = await fetch("http://127.0.0.1:8001/integrations/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, provider: "github" })
  })
  const existingData = await existingCheck.json()
  
  if (existingData.exists) {
    console.log("GitHub integration already exists, redirecting to dashboard")
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?reconnect=true`)
  }

  console.log("Saving integration:", integrationDoc)

  const saveRes = await fetch("http://127.0.0.1:8001/integrations/upsert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(integrationDoc)
  })
  const saveData = await saveRes.json()
  console.log("Save result:", saveData)

  if (!saveRes.ok) {
    console.error("Failed to save integration:", saveData)
    // Still redirect — don't block user
  }

  // Step 6 — Redirect back to dashboard
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?reconnect=true&session_id=${session_id}` 
  )
}
