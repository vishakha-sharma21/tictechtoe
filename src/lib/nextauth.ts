import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/lib/auth.config'
import { upsertGoogleUser, verifyPassword } from '@/lib/users'
import { rateLimit } from '@/lib/rateLimit'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? '').trim().toLowerCase()
        const password = String(creds?.password ?? '')
        if (!EMAIL_RE.test(email) || password.length < 8 || password.length > 128) return null
        // 8 attempts / 15 min per email
        if (!rateLimit(`login:${email}`, 8, 15 * 60 * 1000)) return null
        return verifyPassword(email, password)
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        // Only accept Google accounts whose email Google has verified (prevents account takeover by linking).
        return Boolean(profile?.email && profile.email_verified)
      }
      return true
    },
    async jwt({ token, user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        const u = await upsertGoogleUser(profile.email, profile.name ?? profile.email, profile.picture as string | undefined)
        token.userId = u.id
        token.email = u.email
        token.name = u.name
      } else if (user?.id && account?.provider === 'credentials') {
        token.userId = user.id
      }
      return token
    },
  },
})
