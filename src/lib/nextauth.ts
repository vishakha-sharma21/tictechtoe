import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

// NextAuth configuration with JWT strategy
export const { handlers, signIn, signOut, auth } = NextAuth({
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
            'https://www.googleapis.com/auth/gmail.modify',      // ← add this
  'https://www.googleapis.com/auth/gmail.labels',
            'https://www.googleapis.com/auth/contacts.readonly'
          ].join(' ')
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Log successful user creation
      if (user?.email) {
        console.log(`User signed in: ${user.email}`)
      }
      
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub ?? ''
        session.user.name = token.name ?? ''
        session.user.email = token.email ?? ''
        // Use user_id from token
        session.user.userId = token.userId as string | undefined
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
        token.name = user.name
        token.email = user.email
        // Generate and store user_id for our system
        if (user.email) {
          token.userId = `u${user.email.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toLowerCase()}`
        }
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
  },
  events: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return
      
      try {
        // Get the user_id (u001 format) from integrations collection
        // Find by email since we have it from Google profile
        const response = await fetch("http://localhost:8010/integrations/upsert-by-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: profile.email,
            provider: account.provider,  // "google"
            credentials: {
              access_token: account.access_token,
              refresh_token: account.refresh_token ?? null,
              expires_at: account.expires_at ?? null,
              token_type: account.token_type ?? "bearer",
              scope: account.scope 
                ? account.scope.split(" ").map(s => s.trim())
                : []
            },
            meta: {
              provider_account_id: account.providerAccountId,
              email: profile.email,
              name: profile.name
            }
          })
        })
        const data = await response.json()
        console.log("Google integration saved:", data)
      } catch (err) {
        console.error("Failed to save Google integration:", err)
        // never block login
      }
    }
  },
  pages: {
    signIn: '/',   // redirects to landing, modal handles sign-in
    error: '/auth'
  },
  session: { strategy: 'jwt' },   // required when using MongoDBAdapter
  secret: process.env.NEXTAUTH_SECRET,
})
