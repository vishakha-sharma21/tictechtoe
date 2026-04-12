import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow access to auth pages, homepage, and API routes
  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/dag') ||
    pathname.startsWith('/api')
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  if (!req.auth) {
    const loginUrl = new URL('/auth', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
  runtime: 'nodejs',
}
