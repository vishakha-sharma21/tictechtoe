import React from 'react'
import { Button } from '@/components/shared/Button'
import TextType from '@/components/shared/TextType'

export function DagSection() {
  return (
    <section className="bg-text-primary py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <h2 className="text-4xl lg:text-5xl font-serif mb-6">
              <TextType 
                text={["Not a chain. A graph."]}
                typingSpeed={100}
                pauseDuration={1500}
                showCursor
                cursorCharacter="_"
                deletingSpeed={50}
                cursorBlinkDuration={0.5}
                loop={true}
              />
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Traditional automation tools force you into linear sequences. 
              DAGent builds intelligent workflows that run tools in parallel, 
              wait for dependencies, and optimize execution paths automatically.
            </p>
            
            {/* Stats */}
            <div className="flex gap-8 mb-8">
              <div>
                <div className="text-3xl font-bold text-white mb-1">4×</div>
                <div className="text-sm text-white/60">faster execution</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-white/60">transparency</div>
              </div>
            </div>

            <Button variant="secondary" size="lg" className="bg-white text-text-primary hover:bg-surface">
              See how it works →
            </Button>
          </div>

          {/* Right DAG Visualization */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-large-card p-8">
            <div className="space-y-4">
              {/* Parse Prompt Node */}
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-accent-green rounded-full" />
                  <div className="flex-1">
                    <div className="font-mono text-sm text-white font-semibold">parse_prompt</div>
                    <div className="text-xs text-white/60">extract intent + params</div>
                  </div>
                  <div className="text-xs font-mono text-accent-green">44ms</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="text-white/40 text-sm">↓ splits into 2 parallel branches</div>
              </div>

              {/* Parallel Block */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-accent-blue">⟳</div>
                  <div className="text-xs font-mono text-accent-blue">2 branches running in parallel</div>
                </div>
                
                <div className="space-y-3">
                  {/* Node 2 */}
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-accent-green rounded-full" />
                      <div className="flex-1">
                        <div className="font-mono text-sm text-white font-semibold">fetch_sentry_errors</div>
                        <div className="text-xs text-white/60">latest 10 errors</div>
                      </div>
                      <div className="text-xs font-mono text-accent-green">380ms</div>
                    </div>
                  </div>

                  {/* Node 3 */}
                  <div className="bg-white/[0.04] border border-white/[0.08] rounded-card p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="font-mono text-sm text-white font-semibold">search_github_issues</div>
                        <div className="text-xs text-white/60">check duplicates</div>
                      </div>
                      <div className="text-xs font-mono text-accent-blue">running…</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="text-white/40 text-sm">↓ merges when both complete</div>
              </div>

              {/* Final Node */}
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-card p-4 opacity-55">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                  <div className="flex-1">
                    <div className="font-mono text-sm text-white/60 font-semibold">create_issue + notify_slack</div>
                    <div className="text-xs text-white/40">final step</div>
                  </div>
                  <div className="text-xs font-mono text-white/40">waiting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
