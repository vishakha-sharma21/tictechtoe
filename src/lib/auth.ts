import { signIn } from 'next-auth/react'

export async function signup(name: string, email: string, password: string): Promise<void> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Signup failed')
  // Account created — sign straight in (sets the httpOnly session cookie).
  await login(email, password)
}

export async function login(email: string, password: string): Promise<void> {
  const res = await signIn('credentials', { email, password, redirect: false })
  if (!res || res.error) throw new Error('Invalid email or password')
}
