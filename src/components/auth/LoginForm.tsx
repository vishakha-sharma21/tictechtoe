'use client'

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { setLoginEmail, setLoginPassword, setLoginErrors, clearLoginErrors } from '@/store/authFormsSlice'
import { closeModal, setLoading } from '@/store/authModalSlice'
import { login } from '@/lib/auth'
import { prisma } from '@/lib/database'

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
      window.location.reload() // Simple way to refresh and show logged-in state
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
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700"
            onClick={() => {/* TODO: Implement forgot password */}}
          >
            Forgot password?
          </button>
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

      {/* OAuth */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        onClick={() => {/* TODO: Implement Google OAuth */}}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          className="text-blue-600 hover:text-blue-700 font-medium"
          onClick={() => {/* TODO: Switch to signup tab */}}
        >
          Sign up
        </button>
      </div>
    </div>
  )
}
