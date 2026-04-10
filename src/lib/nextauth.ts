import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { clientPromise } from './mongodb'
import { connectDB } from './connectDB'
import { Integration } from './models/Integration'

// NextAuth configuration with MongoDB adapter
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
            'https://www.googleapis.com/auth/contacts.readonly'
          ].join(' ')
        }
      }
    })
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async signIn({ user, account, profile }) {
      // Log successful user creation
      if (user?.email) {
        console.log(`User signed in: ${user.email}`)
      }
      
      // Non-blocking integrations sync
      if (account?.provider && account?.providerAccountId) {
        try {
          // Run in background without blocking auth flow
          setTimeout(async () => {
            try {
              await connectDB()
              
              const existingIntegration = await (Integration as any).findByProviderAccountId(account.providerAccountId)
              
              if (existingIntegration) {
                // Update existing integration
                await Integration.updateOne(
                  { _id: existingIntegration._id },
                  {
                    $set: {
                      'credentials.access_token': account.access_token,
                      'credentials.refresh_token': account.refresh_token || null,
                      'credentials.expires_at': account.expires_at || null,
                      'credentials.scope': account.scope ? account.scope.split(' ') : [],
                      updated_at: new Date()
                    }
                  }
                )
              } else {
                // Create new integration
                const nextUserId = await (Integration as any).getNextUserId()
                await Integration.create({
                  user_id: nextUserId,
                  provider: account.provider,
                  credentials: {
                    access_token: account.access_token,
                    refresh_token: account.refresh_token || null,
                    expires_at: account.expires_at || null,
                    token_type: 'bearer',
                    scope: account.scope ? account.scope.split(' ') : []
                  },
                  meta: {
                    provider_account_id: account.providerAccountId,
                    email: user.email || '',
                    name: user.name || ''
                  }
                })
              }
            } catch (error) {
              console.error('Integration sync error:', error)
            }
          }, 0)
        } catch (error) {
          console.error('Integration sync setup error:', error)
        }
      }
      
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub ?? ''
        session.user.name = token.name ?? ''
        session.user.email = token.email ?? ''
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
        token.name = user.name
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
  },
  pages: {
    signIn: '/',   // redirects to landing, modal handles sign-in
    error: '/auth'
  },
  session: { strategy: 'jwt' },   // required when using MongoDBAdapter
  secret: process.env.NEXTAUTH_SECRET,
})
