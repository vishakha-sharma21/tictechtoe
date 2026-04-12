'use client'

import React from 'react'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { Button } from './Button'
import { ThemeToggle } from './ThemeToggle'
import { openModal } from '@/store/authModalSlice'

export function Nav() {
  const dispatch = useDispatch()

  const centerLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Docs', href: '/docs' },
    { label: 'Pricing', href: '/pricing' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg-base/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-bg-elevated border border-border flex items-center justify-center text-[11px] font-mono font-bold text-accent transition-transform duration-200 group-hover:scale-[1.02]">
            dg
          </div>
          <span className="font-display text-lg text-text-primary tracking-tight">DAGent</span>
        </Link>

        <div className="hidden md:flex items-center justify-center flex-1 gap-8">
          {centerLinks.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => dispatch(openModal('login'))}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            className="hover:shadow-glow-sm"
            onClick={() => dispatch(openModal('signup'))}
          >
            Get started <span aria-hidden>→</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
