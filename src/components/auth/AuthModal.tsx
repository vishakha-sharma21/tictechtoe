'use client'

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { signIn } from 'next-auth/react'
import { X } from 'lucide-react'
import type { RootState } from '@/store/store'
import { closeModal } from '@/store/authModalSlice'
import { Button } from '@/components/shared/Button'

export default function AuthModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state: RootState) => state.authModal.isOpen)

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' })
    dispatch(closeModal())
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeModal())
      }
    }

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target === e.currentTarget) {
        dispatch(closeModal())
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      
      const overlay = document.getElementById('auth-modal-overlay')
      if (overlay) {
        overlay.addEventListener('click', handleOutsideClick)
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, dispatch])

  if (!isOpen) return null

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 bg-[rgba(10,10,10,0.45)] backdrop-blur-[6px] z-[200] flex items-center justify-center p-4"
    >
      <div
        className="w-full max-w-[480px] bg-white border-[0.5px] border-[#e0ddd6] rounded-[16px] p-6 md:p-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.10)] relative max-h-[90vh] overflow-y-auto"
        style={{
          animation: 'modalIn 0.2s ease',
        }}
      >
        <button
          onClick={() => dispatch(closeModal())}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-2">
            Welcome to DAGent
          </h2>
          <p className="text-sm text-gray-600">
            Sign in with Google to start building intelligent workflows
          </p>
        </div>

        {/* Google OAuth */}
        <Button 
          variant="outline" 
          className="w-full mb-6"
          onClick={handleGoogleSignIn}
        >
          <svg
            className="w-5 h-5 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </Button>

        {/* Info */}
        <div className="text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  )
}
