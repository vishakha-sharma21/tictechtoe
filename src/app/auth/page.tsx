'use client'

import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 border border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display text-text-primary mb-2">Welcome to DAGent</h2>
            <p className="text-sm text-text-secondary">
              Sign in with Google to start building intelligent workflows
            </p>
          </div>

          <div className="w-full mb-6">
            <GoogleSignInButton />
          </div>

          {/* Info */}
          <div className="text-center text-xs text-text-secondary">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  )
}
