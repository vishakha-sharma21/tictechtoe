'use client'

import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

export default function AuthTabs() {
  const activeTab = useSelector((state: RootState) => state.authModal.activeTab)
  return (
    <div className="w-full">
      {activeTab === 'signup' ? <SignupForm /> : <LoginForm />}
      <div className="text-center text-xs text-gray-500 mt-6">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  )
}
