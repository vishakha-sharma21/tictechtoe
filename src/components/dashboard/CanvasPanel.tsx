'use client'

import React, { useState } from 'react'
import { DagNodeCard } from './DagNodeCard'
import { ParallelBlock } from './ParallelBlock'
import { LogViewer } from './LogViewer'
import { mockNodes } from '@/lib/mock-data'

interface CanvasPanelProps {
  workflow: { nodes: any[]; edges: any[] }
  onWorkflowChange: (nodes: any[], edges: any[]) => void
}

export function CanvasPanel({ workflow, onWorkflowChange }: CanvasPanelProps) {
  const [view, setView] = useState<'dag' | 'logs'>('dag')

  return (
    <div className="flex-1 bg-paper flex flex-col">
      {/* Top Bar */}
      <div className="h-13 bg-white border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-text-muted">workflow</span>
          <span className="text-sm text-text-primary">{workflow.nodes.length} nodes</span>
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
            {workflow.nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[#888] text-sm">Workflow will appear here after your first query.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {workflow.nodes.map((node, index) => (
                  <div key={index}>
                    <DagNodeCard
                      node={node}
                      status="done"
                    />
                    {index < workflow.nodes.length - 1 && (
                      <div className="flex justify-center">
                        <div className="w-px h-8 bg-border" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <LogViewer />
        )}
      </div>
    </div>
  )
}
