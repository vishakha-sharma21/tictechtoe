import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const user_id = searchParams.get("user_id")
  const session_id = searchParams.get("session_id")
  
  console.log("GitHub connect:", { user_id, session_id })
  console.log("Client ID:", process.env.GITHUB_CLIENT_ID)
  console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "SET" : "NOT SET")
  console.log("GITHUB_REDIRECT_URI:", process.env.GITHUB_REDIRECT_URI)
  
  if (!process.env.GITHUB_CLIENT_ID) {
    return new Response("GITHUB_CLIENT_ID not set in env", { status: 500 })
  }
  
  const state = Buffer.from(JSON.stringify({ user_id, session_id })).toString("base64")
  
  const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI!)}&scope=repo%20read:user%20user:email&state=${state}` 
  
  return Response.redirect(url)
}
