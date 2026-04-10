import React from 'react'
import { mockWorkflows } from '@/lib/mock-data'

export function Sidebar() {
  return (
    <div className="w-65 bg-paper border-r border-border flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <span className="text-text-muted">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search workflows…"
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-text-muted focus:border-transparent"
          />
        </div>
      </div>

      {/* Workflows List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-3">
            WORKFLOWS
          </h3>
          
          <div className="space-y-1">
            {mockWorkflows.map((workflow) => (
              <button
                key={workflow.id}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  workflow.status === 'running'
                    ? 'bg-white border border-border'
                    : 'hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl">{workflow.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {workflow.name}
                    </div>
                    <div className="text-xs font-mono text-text-muted">
                      {workflow.nodes} nodes · {workflow.elapsed}
                    </div>
                  </div>
                  {workflow.status === 'running' && (
                    <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Workflow Button */}
      <div className="p-4 border-t border-border">
        <button className="w-full p-3 border-2 border-dashed border-border rounded-lg text-sm font-medium text-text-muted hover:border-text-muted hover:text-text-primary transition-colors">
          ＋ New workflow
        </button>
      </div>
    </div>
  )
}
