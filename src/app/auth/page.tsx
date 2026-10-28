'use client'

import AuthTabs from '@/components/auth/AuthTabs'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card p-8 border border-border bg-white">
          <AuthTabs />
        </div>
      </div>
    </div>
  )
}
