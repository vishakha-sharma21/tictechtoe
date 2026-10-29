'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { setLoginEmail, setLoginPassword, setLoginErrors, clearLoginErrors } from '@/store/authFormsSlice'
import { closeModal, setLoading, switchTab } from '@/store/authModalSlice'
import { login } from '@/lib/auth'
import GoogleSection from './GoogleSection'

export default function LoginForm() {
  const dispatch = useDispatch()
  const { email, password, errors } = useSelector((state: RootState) => state.authForms.login)
  const isLoading = useSelector((state: RootState) => state.authModal.isLoading)

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be 8+ characters'
    }

    dispatch(setLoginErrors(newErrors))
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    dispatch(setLoading(true))
    
    try {
      await login(email, password)
      dispatch(setLoading(false))
      dispatch(closeModal())
      // You might want to redirect or update user state here
      window.location.href = '/dashboard'
    } catch (error) {
      dispatch(setLoading(false))
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      dispatch(setLoginErrors({ general: errorMessage }))
    }
  }

  const handleEmailBlur = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      dispatch(setLoginErrors({ email: 'Enter a valid email address' }))
    }
  }

  const handlePasswordBlur = () => {
    if (password && password.length < 8) {
      dispatch(setLoginErrors({ password: 'Password must be 8+ characters' }))
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Welcome back.</h2>
        <p className="text-sm md:text-base text-gray-600">Sign in to your DAGent workspace.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => dispatch(setLoginEmail(e.target.value))}
            onBlur={handleEmailBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => dispatch(setLoginPassword(e.target.value))}
            onBlur={handlePasswordBlur}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <span className="text-xs text-gray-400">Forgot password? Sign in with Google, or contact support.</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <GoogleSection />

      {/* Footer */}
      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          className="text-blue-600 hover:text-blue-700 font-medium"
          onClick={() => dispatch(switchTab('signup'))}
        >
          Sign up
        </button>
      </div>
    </div>
  )
}
