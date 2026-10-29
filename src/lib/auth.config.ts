import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

// Edge-safe config (used by middleware): no DB, no Node-only modules.
// Google login is IDENTITY ONLY. Gmail/Drive access is granted separately via the
// "Google" connector (/api/oauth/google/connect), so signing in never over-requests scopes.
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: { scope: 'openid email profile', prompt: 'select_account' } },
    }),
  ],
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? ''
        session.user.userId = token.userId as string | undefined
      }
      return session
    },
  },
}
