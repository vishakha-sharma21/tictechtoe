import 'reactflow/dist/style.css'
import './globals.css'
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import { auth } from '@/lib/nextauth'
import ReduxProvider from '@/components/providers/ReduxProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import SessionProviderWrapper from '@/components/SessionProviderWrapper'
import AuthModal from '@/components/auth/AuthModal'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} font-sans`}
      >
        <ReduxProvider>
          <ThemeProvider>
            <SessionProviderWrapper session={session}>
              {children}
              <AuthModal />
            </SessionProviderWrapper>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
