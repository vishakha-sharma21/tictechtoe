'use client'

import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { switchTab } from '@/store/authModalSlice'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

export default function AuthTabs() {
  const dispatch = useDispatch()
  const activeTab = useSelector((state: RootState) => state.authModal.activeTab)

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6 md:mb-8">
        <button
          onClick={() => dispatch(switchTab('login'))}
          className={`flex-1 py-2 px-3 md:px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'login'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => dispatch(switchTab('signup'))}
          className={`flex-1 py-2 px-3 md:px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'signup'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sign up
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  )
}
