import { auth } from '@/lib/nextauth'
import { connectDB } from '@/lib/connectDB'
import { Session } from '@/lib/models/Session'
import { NextResponse } from 'next/server'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nodes, edges } = await req.json()

  await connectDB()

  const updated = await Session.findOneAndUpdate(
    { _id: params.id, user_id: session.user.email },
    { $set: { workflow: { nodes, edges }, updated_at: new Date() } },
    { new: true }
  )

  return NextResponse.json({ session: updated })
}
