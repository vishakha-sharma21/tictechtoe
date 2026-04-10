'use client'
import { useSession } from 'next-auth/react'

export function useUser() {
  const { data: session, status } = useSession()

  const name = session?.user?.name ?? ''
  const email = session?.user?.email ?? ''
  const initials = (name?.[0] ?? email?.[0] ?? '?').toUpperCase()
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  return { name, email, initials, isLoading, isAuthenticated, session }
}
