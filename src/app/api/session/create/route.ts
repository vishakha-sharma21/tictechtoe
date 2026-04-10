import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Session } from '@/lib/models/Session'
import { NextResponse } from 'next/server'

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const newSession = await Session.create({
    user_id: session.user.email,
    title: 'New workflow',
    messages: [],
    workflow: { nodes: [], edges: [] },
  })

  return NextResponse.json({ session: newSession })
}
