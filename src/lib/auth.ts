import jwt from 'jsonwebtoken'

export interface User {
  id: string
  email: string
  name?: string | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuthResponse {
  user: User
  token: string
}

export function setAuthCookie(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}` // 7 days
  }
}

export function getAuthCookie(): string | null {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
    return authCookie ? authCookie.split('=')[1] : null
  }
  return null
}

export function removeAuthCookie() {
  if (typeof window !== 'undefined') {
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string }
    return decoded
  } catch (error) {
    return null
  }
}

export async function signup(name: string, email: string, password: string): Promise<{ user: User; message: string }> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed')
  }

  return data
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  setAuthCookie(data.token)
  return data
}
