'use client'

import React, { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import ReactFlow, { Background, Controls, type Node } from 'reactflow'
import { DagFlowNode } from './DagFlowNode'
import { LogViewer } from './LogViewer'
import { sanitizeNodes } from '@/lib/dagUtils'

const nodeTypes = { dagNode: DagFlowNode }

function enhanceNodes(nodes: Node[], isExecuting: boolean): Node[] {
  return nodes.map((n) => {
    const bg = (n.style as { background?: string } | undefined)?.background
    let status = n.data?.status as string | undefined
    if (bg === '#eab308') status = 'running'
    else if (bg === '#22c55e') status = 'success'
    else if (bg === '#ef4444') status = 'error'
    else if (isExecuting && (!status || status === 'pending')) status = 'running'

    return {
      ...n,
      type: 'dagNode',
      data: { ...n.data, status },
    }
  })
}

interface DagPanelProps {
  reactFlowData: { nodes: any[]; edges: any[] }
  isExecuting?: boolean
  chatSession?: {
    chat_history?: { role: string; content: string; timestamp?: string }[]
  } | null
  isOpen?: boolean
  onToggle?: () => void
}

export function DagPanel({
  reactFlowData,
  isExecuting = false,
  chatSession,
  isOpen = true,
  onToggle,
}: DagPanelProps) {
  const [view, setView] = useState<'dag' | 'logs'>('dag')

  const { nodes, edges } = useMemo(() => {
    const rawNodes = reactFlowData?.nodes ?? []
    const rawEdges = reactFlowData?.edges ?? []
    const sanitizedNodes = sanitizeNodes(rawNodes)
    return {
      nodes: enhanceNodes(sanitizedNodes as Node[], !!isExecuting),
      edges: rawEdges.map((e: any) => ({
        ...e,
        animated: !!isExecuting,
        style: {
          stroke: 'var(--border-emphasis)',
          strokeDasharray: isExecuting ? '4 4' : undefined,
        },
      })),
    }
  }, [reactFlowData?.nodes, reactFlowData?.edges, isExecuting])

  const syntheticLogs = useMemo(() => {
    const history = chatSession?.chat_history ?? []
    const lines: { timestamp: string; level: string; message: string }[] = []
    for (const m of history) {
      if (m.role !== 'agent' || !m.content) continue
      if (m.content.includes('✅') || m.content.includes('❌')) {
        const parts = m.content.split('\n').filter(Boolean)
        for (const part of parts) {
          lines.push({
            timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : '—',
            level: part.includes('❌') ? 'ERR' : 'OK',
            message: part.replace(/^[✅❌]\s*/, '').trim(),
          })
        }
      }
    }
    return lines
  }, [chatSession?.chat_history])

  const empty = !reactFlowData?.nodes?.length

  return (
    <div
      className={`flex flex-col bg-bg-base border-l border-border transition-all duration-300 ease-out overflow-hidden ${
        isOpen ? 'flex-1 min-w-0 opacity-100' : 'w-0 min-w-0 max-w-0 flex-none opacity-0 border-0 pointer-events-none'
      }`}
    >
      <div className="h-13 shrink-0 flex items-center justify-between px-2 sm:px-4 border-b border-border bg-bg-surface gap-2">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-bg-elevated border border-border min-w-0">
          <button
            type="button"
            onClick={() => setView('dag')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              view === 'dag'
                ? 'text-text-primary bg-bg-surface border border-border shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            DAG View
          </button>
          <button
            type="button"
            onClick={() => setView('logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
              view === 'logs'
                ? 'text-text-primary bg-bg-surface border border-border shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Logs
          </button>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-text-faint hidden sm:inline">{nodes.length} nodes</span>
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              title="Collapse DAG"
              className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Collapse DAG panel"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {view === 'dag' ? (
          empty ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="font-display text-xl sm:text-2xl text-text-faint mb-2">
                Your workflow will appear here
              </p>
              <p className="text-sm text-text-secondary">Describe a task to get started →</p>
            </div>
          ) : (
            <div className="w-full h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                className="bg-bg-base"
                minZoom={0.2}
                maxZoom={1.5}
              >
                <Background color="var(--border-emphasis)" gap={20} size={1} />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          )
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <LogViewer lines={syntheticLogs.length ? syntheticLogs : undefined} />
          </div>
        )}
      </div>
    </div>
  )
}
