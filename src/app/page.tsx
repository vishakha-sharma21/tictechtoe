'use client'

import React from 'react'
import { useDispatch } from 'react-redux'
import { Nav } from '@/components/shared/Nav'
import { Hero } from '@/components/landing/Hero'
import { Marquee } from '@/components/landing/Marquee'
import { RecipeGrid } from '@/components/landing/RecipeGrid'
import { IntegrationSection } from '@/components/landing/IntegrationSection'
import { DagSection } from '@/components/landing/DagSection'
import { Button } from '@/components/shared/Button'
import TextType from '@/components/shared/TextType'
import AuthModal from '@/components/auth/AuthModal'
import { openModal } from '@/store/authModalSlice'

export default function HomePage() {
  const dispatch = useDispatch()

  return (
    <div className="min-h-screen bg-paper">
      <Nav />
      
      <main>
        <Hero />
        <Marquee />
        <RecipeGrid />
        <DagSection />
        
        {/* Final CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-serif text-text-primary mb-6">
              Let the agent{' '}
              <span className="italic text-text-muted">
                <TextType 
                  text={["handle it.", "automate it.", "stream it.", "build it."]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor
                  cursorCharacter="_"
                  deletingSpeed={50}
                  cursorBlinkDuration={0.5}
                  loop={true}
                />
              </span>
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Stop wasting time on manual workflows. Start building intelligent automations that run in parallel.
            </p>
            <Button 
              size="lg" 
              className="text-base"
              onClick={() => dispatch(openModal('signup'))}
            >
              Try DAGent free
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-text-primary text-paper rounded flex items-center justify-center text-xs font-mono font-bold">
                dg
              </div>
              <span className="font-semibold text-text-primary">DAGent</span>
            </div>
            
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-text-muted hover:text-text-primary transition-colors">
                Status
              </a>
            </nav>
            
            <div className="text-sm text-text-muted">
              © 2024 DAGent. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal />
    </div>
  )
}
