'use client'

import { useState } from 'react'
import { X, Copy, Download } from 'lucide-react'
import { sanitizeNodes } from '@/lib/dagUtils'

interface WorkflowShareModalProps {
  open: boolean
  onClose: () => void
  chatId: string
  title: string
  reactFlow: { nodes: unknown[]; edges: unknown[] }
}

export function WorkflowShareModal({ open, onClose, chatId, title, reactFlow }: WorkflowShareModalProps) {
  const [perm, setPerm] = useState<'view' | 'clone'>('clone')
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const shareUrl = `${origin}/dag/${chatId}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const exportJson = () => {
    const tools_execution_plan = (sanitizeNodes(reactFlow.nodes as any[])).map(
      (n) => ({
        id: n.id,
        tool: n.data?.tool,
        params: n.data?.params,
      })
    )
    const blob = new Blob(
      [JSON.stringify({ react_flow: reactFlow, tools_execution_plan, share_permission: perm }, null, 2)],
      { type: 'application/json' }
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    const safe = (title || 'workflow').replace(/[^\w\d-_]+/g, '-').slice(0, 48)
    a.download = `${safe}-dag.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-[90] w-[min(100%-2rem,420px)] -translate-x-1/2 -translate-y-1/2 rounded-modal border border-border bg-bg-surface p-6 shadow-2xl animate-slide-in">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-display text-lg text-text-primary">Share this workflow</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Anyone with this link can view and clone this DAG with their own tokens.
        </p>
        <div className="rounded-lg border border-border bg-bg-elevated px-3 py-2.5 font-mono text-[11px] text-text-secondary break-all mb-4">
          {shareUrl}
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-sm text-text-primary hover:border-border-emphasis transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            type="button"
            onClick={exportJson}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-sm hover:scale-[1.02] transition-transform"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
        <p className="text-[11px] uppercase tracking-wider text-text-faint mb-2">Permissions</p>
        <label className="flex items-center gap-2 text-sm text-text-secondary mb-2 cursor-pointer">
          <input
            type="radio"
            name="perm"
            checked={perm === 'view'}
            onChange={() => setPerm('view')}
            className="accent-accent"
          />
          View only
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="radio"
            name="perm"
            checked={perm === 'clone'}
            onChange={() => setPerm('clone')}
            className="accent-accent"
          />
          View + Clone (recommended)
        </label>
      </div>
    </>
  )
}
