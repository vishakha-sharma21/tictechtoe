import React from 'react'
import { WorkflowNode } from '@/types'
import { Badge } from '@/components/shared/Badge'

interface DagNodeCardProps {
  node: WorkflowNode
  status: 'done' | 'running' | 'idle'
}

export function DagNodeCard({ node, status }: DagNodeCardProps) {
  const statusConfig = {
    done: {
      dotColor: 'bg-accent-green',
      borderColor: 'border-accent-green',
      bgColor: 'bg-accent-green-bg',
      badgeVariant: 'success' as const,
      statusText: 'done',
    },
    running: {
      dotColor: 'bg-accent-blue animate-pulse',
      borderColor: 'border-accent-blue',
      bgColor: 'bg-accent-blue-bg',
      badgeVariant: 'default' as const,
      statusText: 'running…',
    },
    idle: {
      dotColor: 'bg-text-faint',
      borderColor: 'border-border',
      bgColor: 'bg-surface',
      badgeVariant: 'muted' as const,
      statusText: 'waiting',
    },
  }

  const config = statusConfig[status]

  return (
    <div className={`card p-4 transition-all hover:shadow-md ${
      status === 'idle' ? 'opacity-55' : ''
    } ${config.borderColor} ${config.bgColor}`}>
      <div className="flex items-center gap-3">
        {/* Status Dot */}
        <div className={`w-3 h-3 rounded-full ${config.dotColor}`} />
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-mono font-semibold text-text-primary">
              {node.name}
            </span>
            <Badge variant={config.badgeVariant} className="text-xs">
              {config.statusText}
            </Badge>
          </div>
          <div className="text-xs text-text-muted">
            {node.desc}
          </div>
        </div>
        
        {/* Time/Status */}
        <div className="text-right">
          {node.ms ? (
            <span className="text-xs font-mono text-text-muted">
              {node.ms}ms
            </span>
          ) : (
            <span className="text-xs font-mono text-text-muted">
              {config.statusText}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
