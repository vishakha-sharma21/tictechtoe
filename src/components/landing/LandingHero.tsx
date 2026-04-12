'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'

const WORDS = ['stack', 'APIs', 'tools', 'workflows']

/** Fixed positions — stable across SSR/client */
const HERO_DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: ((i * 37 + 11) % 89) + 5,
  y: ((i * 53 + 17) % 84) + 8,
  duration: 3 + (i % 5) * 0.35,
  delay: ((i * 13) % 50) / 10,
}))

type Props = {
  onStartBuilding: () => void
}

export function LandingHero({ onStartBuilding }: Props) {
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-16 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border-emphasis) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(124,111,205,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        {HERO_DOTS.map((dot) => (
          <div
            key={dot.id}
            style={{
              position: 'absolute',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: 'var(--accent)',
              opacity: 0.3,
              animation: `heroFloat ${dot.duration}s ease-in-out ${dot.delay}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex mb-8 opacity-0 animate-fade-up" style={{ animationDelay: '0s' }}>
          <Badge variant="accent" className="gap-1.5 px-3 py-1.5 text-[13px]">
            <span aria-hidden>⚡</span> Now in beta — built at hackathon speed
          </Badge>
        </div>

        <h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.08] text-text-primary mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        >
          Stop duct-taping
          <br />
          <span className="text-text-primary">your </span>
          <span
            key={wordIndex}
            className="inline-block text-center font-display italic transition-opacity duration-300"
            style={{
              color: 'var(--accent)',
              minWidth: '160px',
            }}
          >
            {WORDS[wordIndex]}.
          </span>
        </h1>

        <p
          className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed opacity-0 animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          Describe any task in plain English. DAGent turns it into a live workflow — connecting your tools,
          executing in order, handling errors automatically.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 opacity-0 animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Button size="lg" className="w-full sm:w-auto min-w-[200px]" onClick={onStartBuilding}>
            → Start building free
          </Button>
          <a
            href="https://www.youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-card font-medium transition-all duration-200 border border-border bg-transparent text-text-primary hover:bg-bg-elevated hover:border-border-emphasis px-6 py-3 text-base gap-2 w-full sm:w-auto min-w-[200px]"
          >
            Watch demo ↗
          </a>
        </div>

        <p
          className="text-sm text-text-faint opacity-0 animate-fade-up"
          style={{ animationDelay: '0.4s' }}
        >
          <span className="text-text-secondary">✦ Used by 200+ developers</span>
          <span className="mx-2">·</span>
          GitHub · Slack · Notion
        </p>
      </div>
    </section>
  )
}
