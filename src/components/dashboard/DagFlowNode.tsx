'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

function statusClass(status: string | undefined) {
  switch (status) {
    case 'success':
      return 'border-accent-green bg-accent-green/15 text-accent-green'
    case 'error':
      return 'border-accent-red bg-accent-red/20 text-accent-red'
    case 'running':
      return 'border-accent-yellow bg-accent-yellow/15 text-accent-yellow animate-node-pulse'
    default:
      return 'border-border-emphasis bg-bg-elevated text-text-secondary'
  }
}

export const DagFlowNode = memo(function DagFlowNode({ data, selected }: NodeProps) {
  const label = (data?.label as string) || (data?.tool as string) || 'Step'
  const tool = (data?.tool as string) || ''
  const status = data?.status as string | undefined

  return (
    <div
      className={`
        min-w-[160px] max-w-[220px] rounded-lg border px-3 py-2 shadow-sm transition-all duration-500 ease-out
        ${statusClass(status)}
        ${selected ? 'ring-2 ring-accent/40' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-border-emphasis !w-2 !h-2" />
      <p className="text-xs font-medium text-text-primary truncate">{label}</p>
      {tool && <p className="text-[10px] font-mono text-text-faint truncate mt-0.5">{tool}</p>}
      <Handle type="source" position={Position.Bottom} className="!bg-border-emphasis !w-2 !h-2" />
    </div>
  )
})
