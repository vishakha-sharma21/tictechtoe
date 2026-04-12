'use client'

import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton'

export default function AuthTabs() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-gray-900 mb-2">
          Welcome to DAGent
        </h2>
        <p className="text-sm text-gray-600">
          Sign in with Google to start building intelligent workflows
        </p>
      </div>

      <div className="w-full mb-6">
        <GoogleSignInButton forceLight />
      </div>

      {/* Info */}
      <div className="text-center text-xs text-gray-500">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  )
}
