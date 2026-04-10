import './globals.css'
import { Inter } from 'next/font/google'
import { auth } from '@/lib/nextauth'
import ReduxProvider from '@/components/providers/ReduxProvider'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
import AuthModal from '@/components/auth/AuthModal'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DAGent - AI Workflow Orchestration',
  description: 'Stop duct-taping your stack. Let the agent handle it.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <SessionProviderWrapper session={session}>
            {children}
            <AuthModal />
          </SessionProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  )
}
