'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ReactFlow, { Background, Controls, type Node } from 'reactflow'
import { signIn } from 'next-auth/react'
import { Nav } from '@/components/shared/Nav'
import { DagFlowNode } from '@/components/dashboard/DagFlowNode'
import { sanitizeNodes } from '@/lib/dagUtils'
import { Button } from '@/components/shared/Button'

const nodeTypes = { dagNode: DagFlowNode }

type PublicPayload = {
  title: string
  react_flow: { nodes: Node[]; edges: any[] }
  created_at: string
}

export default function PublicDagPage() {
  const params = useParams()
  const id = params.id as string
  const [data, setData] = useState<PublicPayload | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/chats/${id}/public`)
        if (!res.ok) {
          setError(res.status === 404 ? 'Workflow not found.' : 'Could not load workflow.')
          return
        }
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setError('Could not load workflow.')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id])

  const nodes = useMemo(() => {
    const raw = data?.react_flow?.nodes ?? []
    return sanitizeNodes(raw).map((n: Node) => ({
      ...n,
      type: 'dagNode',
      data: { ...n.data, status: n.data?.status || 'pending' },
    }))
  }, [data?.react_flow?.nodes])

  const tools = useMemo(() => {
    const set = new Set<string>()
    for (const n of nodes) {
      const t = n.data?.tool as string | undefined
      if (t) set.add(t)
    }
    return Array.from(set)
  }, [nodes])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary grain">
      <Nav />
      <main className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        {error && (
          <p className="text-center text-accent-red text-sm mb-8">{error}</p>
        )}
        {data && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-mono text-text-faint uppercase tracking-wider mb-2">
                  Shared workflow
                </p>
                <h1 className="font-display text-3xl sm:text-4xl text-text-primary">{data.title}</h1>
                <p className="text-xs text-text-secondary mt-2">
                  Created {new Date(data.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                >
                  Clone this workflow →
                </Button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-card font-medium transition-all duration-200 px-3 py-1.5 text-sm gap-2 border border-border bg-transparent text-text-primary hover:bg-bg-elevated"
                >
                  Home
                </Link>
              </div>
            </div>

            {tools.length > 0 && (
              <div className="mb-6 rounded-large-card border border-border bg-bg-surface p-4">
                <p className="text-[11px] uppercase tracking-wider text-text-faint mb-2">Tools in this DAG</p>
                <ul className="flex flex-wrap gap-2">
                  {tools.map((t) => (
                    <li
                      key={t}
                      className="text-xs font-mono px-2 py-1 rounded-md bg-bg-elevated border border-border text-text-secondary"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="h-[480px] rounded-modal border border-border overflow-hidden bg-bg-base">
              {nodes.length === 0 ? (
                <div className="h-full flex items-center justify-center text-text-secondary text-sm">
                  No graph data
                </div>
              ) : (
                <ReactFlow
                  nodes={nodes}
                  edges={data.react_flow.edges || []}
                  nodeTypes={nodeTypes}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnScroll
                  zoomOnScroll
                  proOptions={{ hideAttribution: true }}
                  className="bg-bg-base"
                >
                  <Background color="var(--border-emphasis)" gap={20} size={1} />
                  <Controls showInteractive={false} />
                </ReactFlow>
              )}
            </div>

            <p className="text-center text-[11px] text-text-faint mt-8">Built with DAGent</p>
          </>
        )}
      </main>
    </div>
  )
}
