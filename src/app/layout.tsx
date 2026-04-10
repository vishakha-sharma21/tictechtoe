import './globals.css'
import { Inter } from 'next/font/google'
import ReduxProvider from '@/components/providers/ReduxProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DAGent - AI Workflow Orchestration',
  description: 'Stop duct-taping your stack. Let the agent handle it.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
