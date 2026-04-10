import { Inter, JetBrains_Mono, Playfair_Display } from 'next/font/google'

export const instrumentSerif = Playfair_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

export const geist = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})

export const geistMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})
