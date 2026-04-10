'use client'

import React, { useState } from 'react'
import { DagNodeCard } from './DagNodeCard'
import { ParallelBlock } from './ParallelBlock'
import { LogViewer } from './LogViewer'
import { mockNodes } from '@/lib/mock-data'

export function CanvasPanel() {
  const [view, setView] = useState<'dag' | 'logs'>('dag')

  return (
    <div className="flex-1 bg-paper flex flex-col">
      {/* Top Bar */}
      <div className="h-13 bg-white border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-text-muted">wf_7f2kp</span>
          <span className="text-sm text-text-primary">{mockNodes.length} nodes · completed 2.8s</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('dag')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              view === 'dag' 
                ? 'bg-surface text-text-primary border border-border' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            DAG View
          </button>
          <button
            onClick={() => setView('logs')}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              view === 'logs' 
                ? 'bg-surface text-text-primary border border-border' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Logs
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {view === 'dag' ? (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent-blue to-purple-500 rounded-full transition-all duration-600"
                  style={{ width: '75%' }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs font-mono text-text-muted">3/4 nodes · 2.8s elapsed</span>
              </div>
            </div>

            {/* DAG Nodes */}
            <div className="space-y-4">
              {/* Parse Prompt Node */}
              <DagNodeCard
                node={mockNodes[0]}
                status="done"
              />

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-border" />
              </div>

              {/* Parallel Block */}
              <ParallelBlock
                nodes={mockNodes.slice(1, 3)}
              />

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-px h-8 bg-border" />
              </div>

              {/* Final Node */}
              <DagNodeCard
                node={mockNodes[3]}
                status="idle"
              />
            </div>
          </div>
        ) : (
          <LogViewer />
        )}
      </div>
    </div>
  )
}
