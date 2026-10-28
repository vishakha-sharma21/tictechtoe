import { NextResponse } from 'next/server'

// Lets the UI hide "Continue with Google" until Google OAuth credentials are configured.
export async function GET() {
  return NextResponse.json({ google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) })
}
