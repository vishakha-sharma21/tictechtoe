import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Session } from '@/lib/models/Session'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sessions = await Session
    .find({ user_id: session.user.email })
    .sort({ updated_at: -1 })
    .select('_id title created_at updated_at messages')
    .lean()

  return NextResponse.json({ sessions })
}
