'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { examplePrompts } from '@/lib/mock-data'

export function Hero() {
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  
  // Intersection Observer refs for different elements
  const [badgeRef, badgeVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [headlineRef, headlineVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [subtextRef, subtextVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [buttonsRef, buttonsVisible] = useIntersectionObserver({ threshold: 0.1 })
  const [demoRef, demoVisible] = useIntersectionObserver({ threshold: 0.1 })

  useEffect(() => {
    const currentPrompt = examplePrompts[currentPromptIndex]
    
    if (isTyping) {
      if (displayedText.length < currentPrompt.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentPrompt.slice(0, displayedText.length + 1))
        }, 38)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2800)
        return () => clearTimeout(timeout)
      }
    } else {
      const timeout = setTimeout(() => {
        setDisplayedText('')
        setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length)
        setIsTyping(true)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [displayedText, isTyping, currentPromptIndex])

  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Eyebrow Badge */}
        <div 
          ref={badgeRef}
          className={`mb-8 transition-all duration-700 ease-out ${
            badgeVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4'
          }`}
        >
          <Badge variant="muted">
            v1.0 — now live · DAG execution engine
          </Badge>
        </div>

        {/* Hero Headline */}
        <h1 
          ref={headlineRef}
          className={`text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-6 leading-tight transition-all duration-700 ease-out delay-100 ${
            headlineVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-6'
          }`}
        >
          Stop duct-taping{' '}
          <span className="italic text-text-muted">your stack.</span>
          <br />
          Let the agent handle it.
        </h1>

        {/* Subtext */}
        <p 
          ref={subtextRef}
          className={`text-base text-text-secondary max-w-2xl mx-auto mb-10 font-light transition-all duration-700 ease-out delay-200 ${
            subtextVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4'
          }`}
        >
          Describe what you need. DAGent plans the workflow, fires the tools, and streams results — in parallel.
        </p>

        {/* CTA Buttons */}
        <div 
          ref={buttonsRef}
          className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 ease-out delay-300 ${
            buttonsVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-4'
          }`}
        >
          <Button size="md" className="text-base">
            Try it free
          </Button>
          <Button variant="outline" size="md" className="text-base">
            See the interface →
          </Button>
        </div>

        {/* Animated Prompt Demo */}
        <div 
          ref={demoRef}
          className={`max-w-2xl mx-auto transition-all duration-700 ease-out delay-400 ${
            demoVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-8'
          }`}
        >
          <div className="card p-6 shadow-sm">
            <div className="text-left">
              <label className="text-xs font-mono text-text-muted mb-3 block">
                USER PROMPT
              </label>
              <div className="min-h-[3.5rem] font-mono text-sm text-text-primary mb-4">
                {displayedText}
                <span className="inline-block w-2 h-4 bg-text-primary ml-1 animate-pulse" />
              </div>
              
              {/* Live Node Status */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent-green rounded-full" />
                  <span className="text-xs font-mono text-text-muted">fetch_sentry_errors</span>
                  <span className="text-xs font-mono text-accent-green">done</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-text-muted">create_github_issue</span>
                  <span className="text-xs font-mono text-accent-blue">running</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-text-faint rounded-full" />
                  <span className="text-xs font-mono text-text-muted">post_slack_message</span>
                  <span className="text-xs font-mono text-text-muted">pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
