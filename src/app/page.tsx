'use client'

import React from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Nav } from '@/components/shared/Nav'
import { Button } from '@/components/shared/Button'
import { Marquee } from '@/components/landing/Marquee'
import { LandingHero } from '@/components/landing/LandingHero'
import { useAuthSync } from '@/hooks/useAuthSync'
import { Zap, Link2, Brain, UserCheck, GitBranch, Lock } from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    title: 'Natural Language → DAG',
    body: 'Describe what you need. We figure out the steps.',
  },
  {
    icon: Link2,
    title: '20+ Tool Integrations',
    body: 'GitHub, Slack, Jira, Twilio, Discord and more.',
  },
  {
    icon: Brain,
    title: 'AI Orchestration',
    body: 'GPT-4o plans your workflow, handles edge cases.',
  },
  {
    icon: UserCheck,
    title: 'Human in the Loop',
    body: 'Review and modify before anything executes.',
  },
  {
    icon: GitBranch,
    title: 'Live DAG Visualization',
    body: 'Watch your workflow execute in real time.',
  },
  {
    icon: Lock,
    title: 'Your Credentials, Your Control',
    body: 'OAuth per tool. Tokens stored securely per user.',
  },
]

export default function HomePage() {
  const { status } = useAuthSync()

  const handleGetStarted = () => {
    if (status === 'authenticated') {
      window.location.href = '/dashboard'
    } else {
      signIn('google', { callbackUrl: '/dashboard' })
    }
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary grain">
      <Nav />

      <main className="pt-14">
        <LandingHero onStartBuilding={handleGetStarted} />

        <Marquee />

        {/* FEATURES */}
        <section id="features" className="py-24 px-4 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-center mb-4">Everything you need to ship</h2>
            <p className="text-text-secondary text-center max-w-xl mx-auto mb-14">
              One orchestration layer for the tools you already use.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map(({ icon: Icon, title, body }, i) => (
                <div
                  key={title}
                  className="group rounded-large-card border border-border bg-bg-surface p-6 hover-lift hover:bg-bg-elevated transition-colors duration-200"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-bg-elevated border border-border flex items-center justify-center mb-4 text-accent">
                    <Icon className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-4 border-t border-border scroll-mt-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl text-center mb-16">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8 md:gap-4 items-start">
              {[
                { n: '1', title: 'Describe', desc: 'Tell DAGent what outcome you want in plain language.' },
                { n: '2', title: 'Review DAG', desc: 'Inspect the generated plan and tweak steps before running.' },
                { n: '3', title: 'Execute', desc: 'Run tools in order with live status on every node.' },
              ].map((step, idx) => (
                <div key={step.n} className="relative flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full border border-border-emphasis bg-bg-elevated flex items-center justify-center text-accent font-mono text-lg mb-4">
                    {step.n}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                  <p className="text-sm text-text-secondary max-w-xs">{step.desc}</p>
                  {idx < 2 && (
                    <div
                      className="hidden md:block absolute top-6 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-px bg-gradient-to-r from-border-emphasis to-transparent pointer-events-none"
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SHARE */}
        <section id="share" className="py-24 px-4 border-t border-border scroll-mt-20">
          <div className="max-w-4xl mx-auto rounded-modal border border-border bg-bg-surface p-8 sm:p-12">
            <h2 className="font-display text-3xl sm:text-4xl mb-4">Share your workflows.</h2>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Built a great DAG? Share it with your team or the community. Anyone with the link can view, clone,
              and run your workflow with their own credentials.
            </p>
            <ul className="space-y-3 mb-10 text-sm text-text-secondary">
              <li>🔗 Shareable link per workflow</li>
              <li>👁 View-only or clone permission</li>
              <li>🔑 Runs with viewer&apos;s own OAuth tokens</li>
              <li>📦 Export as JSON template</li>
            </ul>
            <Button size="lg" onClick={handleGetStarted}>
              Share your first workflow →
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto rounded-modal border border-border bg-bg-elevated px-8 py-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl mb-4">Ready to automate your stack?</h2>
            <p className="text-text-secondary mb-8">Connect your first tool and build in minutes.</p>
            <Button size="lg" onClick={handleGetStarted}>
              Get started free →
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-bg-surface py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-[10px] font-mono font-bold text-accent">
              dg
            </div>
            <span className="font-display text-text-primary">DAGent</span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
            <Link href="/recipes" className="hover:text-text-primary transition-colors">
              Recipes
            </Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text-primary transition-colors">
              Terms
            </Link>
            <Link href="/docs" className="hover:text-text-primary transition-colors">
              Docs
            </Link>
            <Link href="/pricing" className="hover:text-text-primary transition-colors">
              Pricing
            </Link>
          </nav>
          <p className="text-sm text-text-faint text-center md:text-right">Built with obsession. MIT License.</p>
        </div>
      </footer>
    </div>
  )
}
