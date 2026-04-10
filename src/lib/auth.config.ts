import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

// Edge-safe auth configuration - no MongoDB adapter or Node.js modules
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/contacts.readonly'
          ].join(' ')
        }
      }
    })
  ],
  pages: {
    signIn: '/auth',
    error: '/auth'
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async signIn({ user, account }) {
      return true
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.id = token.email
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user?.email) {
        token.email = user.email
      }
      // Store OAuth tokens from account in JWT for API route processing
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token
      }
      if (account?.expires_at) {
        token.expiresAt = account.expires_at
      }
      if (account?.scope) {
        token.scope = account.scope
      }
      return token
    }
  }
}
