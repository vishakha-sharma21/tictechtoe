'use client'

import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { X } from 'lucide-react'
import type { RootState } from '@/store/store'
import { closeModal } from '@/store/authModalSlice'
import AuthTabs from './AuthTabs'

export default function AuthModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state: RootState) => state.authModal.isOpen)

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

        <AuthTabs />
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
