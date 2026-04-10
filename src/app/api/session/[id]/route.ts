import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Session } from '@/lib/models/Session'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const sessionData = await Session.findOne({
    _id: params.id,
    user_id: session.user.email,  // scope to user — never allow cross-user fetch
  }).lean()

  if (!sessionData) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ session: sessionData })
}
