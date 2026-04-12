'use client'

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import {
  setSignupName,
  setSignupEmail,
  setSignupPassword,
  setSignupConfirmPassword,
  setSignupErrors,
  setPasswordStrength,
} from '@/store/authFormsSlice'
import { closeModal, setLoading, switchTab } from '@/store/authModalSlice'
import PasswordStrength from './PasswordStrength'
import { signup } from '@/lib/auth'
import { GoogleSignInButton } from '@/components/shared/GoogleSignInButton'

export default function SignupForm() {
  const dispatch = useDispatch()
  const { name, email, password, confirmPassword, errors, passwordStrength } = useSelector(
    (state: RootState) => state.authForms.signup
  )
  const isLoading = useSelector((state: RootState) => state.authModal.isLoading)
  const [showPassword, setShowPassword] = useState(false)

  // Calculate password strength whenever password changes
  useEffect(() => {
    const calculateStrength = (pwd: string): 0 | 1 | 2 | 3 | 4 => {
      let strength = 0
      
      if (pwd.length >= 8) strength++
      if (pwd.length >= 12) strength++
      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
      if (/[0-9]/.test(pwd)) strength++
      if (/[^a-zA-Z0-9]/.test(pwd)) strength++
      
      return Math.min(strength, 4) as 0 | 1 | 2 | 3 | 4
    }

    const strength = calculateStrength(password)
    dispatch(setPasswordStrength(strength))
  }, [password, dispatch])

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!name) {
      newErrors.name = 'Name is required'
    } else if (name.length < 2) {
      newErrors.name = 'Name must be 2+ characters'
    }

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

    if (password !== confirmPassword) {
      newErrors.general = 'Passwords do not match'
    }

    dispatch(setSignupErrors(newErrors))
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    dispatch(setLoading(true))
    
    try {
      await signup(name, email, password)
      dispatch(setLoading(false))
      dispatch(closeModal())
      // You might want to redirect or update user state here
      window.location.reload() // Simple way to refresh and show logged-in state
    } catch (error) {
      dispatch(setLoading(false))
      const errorMessage = error instanceof Error ? error.message : 'Signup failed'
      dispatch(setSignupErrors({ general: errorMessage }))
    }
  }

  const handleEmailBlur = () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      dispatch(setSignupErrors({ email: 'Enter a valid email address' }))
    }
  }

  const handlePasswordBlur = () => {
    if (password && password.length < 8) {
      dispatch(setSignupErrors({ password: 'Password must be 8+ characters' }))
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Create your account.</h2>
        <p className="text-sm md:text-base text-gray-600">Free forever. No credit card required.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => dispatch(setSignupName(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="signup-email"
            value={email}
            onChange={(e) => dispatch(setSignupEmail(e.target.value))}
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
          <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="signup-password"
              value={password}
              onChange={(e) => dispatch(setSignupPassword(e.target.value))}
              onBlur={handlePasswordBlur}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          
          {/* Password Strength */}
          {password && <PasswordStrength strength={passwordStrength} />}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => dispatch(setSignupConfirmPassword(e.target.value))}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.general ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm your password"
          />
          {errors.general && (
            <p className="mt-1 text-sm text-red-600">{errors.general}</p>
          )}
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
              Creating account...
            </div>
          ) : (
            'Create account'
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

      <GoogleSignInButton forceLight />

      {/* Footer */}
      <div className="space-y-2">
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => dispatch(switchTab('login'))}
          >
            Sign in
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
        </div>
      </div>
    </div>
  )
}
