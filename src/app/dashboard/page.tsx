import { auth } from '@/lib/nextauth'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/')
  return <DashboardShell />
}
