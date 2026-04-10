'use client'

import React from 'react'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { Button } from './Button'
import PillNav from './PillNav'
import { openModal } from '@/store/authModalSlice'

export function Nav() {
  const dispatch = useDispatch()
  
  const navItems = [
    { label: 'home', href: '/' },
    { label: 'recipes', href: '/recipes' },
    { label: 'pricing', href: '/pricing' },
    { label: 'docs', href: '/docs' }
  ]

  return (
    <nav className="fixed top-6 left-0 right-0 h-14 bg-paper/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-4xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-text-primary text-paper rounded flex items-center justify-center text-xs font-mono font-bold transition-transform duration-300 group-hover:scale-110">
              dg
            </div>
            <span className="font-semibold text-text-primary transition-colors duration-300 group-hover:text-accent-blue">DAGent</span>
          </Link>

          {/* Center Navigation - PillNav */}
          <div className="hidden md:flex flex-1 justify-center">
            <PillNav 
              items={navItems}
              activeHref="/"
              className="custom-nav"
              ease="power2.easeOut"
              baseColor="#ffffff"
              pillColor="#000000"
              hoveredPillTextColor="#000000"
              pillTextColor="#ffffff"
              initialLoadAnimation={false}
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="transition-all duration-300 hover:scale-105 hover:shadow-md"
              onClick={() => dispatch(openModal('login'))}
            >
              Sign in
            </Button>
            <Button 
              size="sm" 
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => dispatch(openModal('signup'))}
            >
              Get started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
