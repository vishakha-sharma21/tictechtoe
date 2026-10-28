'use client'

import { useEffect, useState } from 'react'
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton'

/** Divider + Google button, rendered only when the server has Google OAuth credentials. */
export default function GoogleSection() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    fetch('/api/auth-config')
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d.google)))
      .catch(() => {})
  }, [])
  if (!enabled) return null
  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      <GoogleSignInButton forceLight />
    </>
  )
}
