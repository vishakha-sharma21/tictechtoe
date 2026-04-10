'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function useAuthSync() {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Sync user data to MongoDB when session is established
    if (status === 'authenticated' && session?.user?.email) {
      // Get OAuth tokens from session (if available)
      const syncUserData = async () => {
        try {
          // Call the sync API to store user data and OAuth tokens
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // These will be populated by NextAuth from the JWT
              accessToken: (session as any)?.accessToken,
              refreshToken: (session as any)?.refreshToken,
              expiresAt: (session as any)?.expiresAt,
              scope: (session as any)?.scope,
              tokenType: 'Bearer'
            })
          })
        } catch (error) {
          console.error('Failed to sync user data:', error)
        }
      }

      syncUserData()
    }
  }, [status, session])

  return { session, status }
}
