import React from 'react'
import { Badge } from '@/components/shared/Badge'
import { mockNodes } from '@/lib/mock-data'

export function WorkflowCard() {
  const completedNodes = mockNodes.filter(node => node.status === 'done').length
  const totalNodes = mockNodes.length

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent-green rounded-full" />
          <span className="text-xs font-mono text-text-muted">wf_7f2kp</span>
          <Badge variant="success">running</Badge>
        </div>
      </div>

      {/* Step List */}
      <div className="space-y-2 mb-3">
        {mockNodes.map((node) => (
          <div key={node.id} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              node.status === 'done' ? 'bg-accent-green' :
              node.status === 'running' ? 'bg-accent-blue animate-pulse' :
              'bg-text-faint'
            }`} />
            <span className="text-xs font-mono text-text-primary">{node.name}</span>
            {node.ms && (
              <span className="text-xs font-mono text-text-muted ml-auto">{node.ms}ms</span>
            )}
          </div>
        ))}
      </div>

      {/* Completion Bar */}
      <div className="relative">
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent-green rounded-full transition-all duration-600"
            style={{ width: `${(completedNodes / totalNodes) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-mono text-accent-green">✓ Completed in 2.8s</span>
          <span className="text-xs font-mono text-text-muted">{completedNodes}/{totalNodes} nodes</span>
        </div>
      </div>
    </div>
  )
}
