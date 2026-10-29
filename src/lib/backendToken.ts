import jwt from 'jsonwebtoken'

/** Short-lived token the browser presents to the Python backend. The backend derives user_id from `sub`. */
export function signBackendToken(userId: string): string {
  const secret = process.env.BACKEND_JWT_SECRET
  if (!secret) throw new Error('BACKEND_JWT_SECRET not set')
  return jwt.sign({ sub: userId }, secret, { algorithm: 'HS256', expiresIn: '10m', audience: 'mcp_agent' })
}
