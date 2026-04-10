import React from 'react'
import { WorkflowNode } from '@/types'
import { DagNodeCard } from './DagNodeCard'

interface ParallelBlockProps {
  nodes: WorkflowNode[]
}

export function ParallelBlock({ nodes }: ParallelBlockProps) {
  return (
    <div className="bg-muted-surface border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-accent-blue">⟳</span>
        <span className="text-xs font-mono text-accent-blue">
          {nodes.length} branches running in parallel
        </span>
      </div>
      
      {/* Parallel Nodes */}
      <div className="space-y-3">
        {nodes.map((node, index) => (
          <DagNodeCard
            key={node.id}
            node={node}
            status={node.status as 'done' | 'running' | 'idle'}
          />
        ))}
      </div>
    </div>
  )
}
