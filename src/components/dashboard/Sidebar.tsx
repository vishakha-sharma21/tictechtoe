'use client'
import { useMemo, useState } from 'react'
import { Plus, Trash2, Zap, ChevronLeft } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface ChatSession {
  _id: string
  session_id: string
  title: string
  query: string
  chat_history: { role: 'human' | 'agent'; content: string }[]
  react_flow: { nodes: any[]; edges: any[] }
  completed: boolean
  created_at: string
  updated_at: string
}

interface SidebarProps {
  sessions: ChatSession[]
  activeId: string | null
  onSelect: (id: string) => void
  onNewSession: () => void
  onDeleteSession: (id: string) => void
  isCreating: boolean
  isOpen?: boolean
  onToggle?: () => void
}

export default function Sidebar({
  sessions,
  activeId,
  onSelect,
  onNewSession,
  onDeleteSession,
  isCreating,
  isOpen = true,
  onToggle,
}: SidebarProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const { name, email, initials } = useUser()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sessions.filter((s) => s && s._id)
    return sessions.filter((s) => s && s._id && (s.title || '').toLowerCase().includes(q))
  }, [sessions, search])

  return (
    <div
      className={`border-r border-border bg-bg-surface flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-out ${
        isOpen ? 'w-[260px] min-w-[260px] opacity-100' : 'w-0 min-w-0 max-w-0 border-0 opacity-0 pointer-events-none'
      }`}
    >
      <div className="p-3 border-b border-border flex items-start gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center border border-border-emphasis shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-text-primary truncate">{name || 'You'}</p>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border border-border text-text-faint shrink-0">
                Free
              </span>
            </div>
            <p className="text-[11px] text-text-secondary truncate">{email || '—'}</p>
          </div>
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            title="Collapse workflows"
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors shrink-0"
            aria-label="Collapse workflows panel"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-[13px] bg-bg-base text-text-primary placeholder:text-text-faint outline-none border border-transparent focus:border-accent shadow-none transition-all duration-200 focus:shadow-glow-sm"
          placeholder="Search workflows…"
        />
      </div>

      <p className="px-4 pb-2 font-mono text-[10px] tracking-widest text-text-faint uppercase">Workflows</p>

      <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-1 pb-2">
        {filtered.length === 0 && (
          <div className="text-center py-6 px-2">
            <p className="text-text-secondary text-xs">No workflows match your search.</p>
          </div>
        )}
        {filtered.map((session) => (
          <div
            key={session._id}
            className={`group relative rounded-lg transition-all duration-200 ${
              activeId === session._id
                ? 'bg-bg-elevated before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-accent'
                : 'hover:bg-bg-elevated'
            }`}
          >
            {confirmingId === session._id ? (
              <div className="flex items-center gap-2 px-2 py-2">
                <button
                  type="button"
                  onClick={async () => {
                    setDeletingId(session._id)
                    await onDeleteSession(session._id)
                    setDeletingId(null)
                    setConfirmingId(null)
                  }}
                  disabled={deletingId === session._id}
                  className="flex-1 text-[11px] text-accent-red hover:bg-accent-red/10 px-1 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {deletingId === session._id ? 'Deleting…' : 'Confirm delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingId(null)}
                  disabled={deletingId === session._id}
                  className="flex-1 text-[11px] text-text-secondary hover:bg-bg-base px-1 py-1 rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(session._id)
                  }
                }}
                onClick={() => onSelect(session._id)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 w-full text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-bg-base border border-border flex items-center justify-center flex-shrink-0 text-accent">
                  <Zap className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-text-primary truncate">{session.title}</p>
                  <p className="text-[10px] font-mono text-text-faint">
                    {new Date(session.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setConfirmingId(session._id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-text-secondary hover:text-accent-red rounded-md"
                  aria-label="Delete workflow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-border mt-auto">
        <button
          type="button"
          onClick={onNewSession}
          disabled={isCreating}
          className={`w-full flex items-center justify-center gap-2 border border-dashed border-border rounded-lg py-2.5 text-[13px] transition-all duration-200 ${
            isCreating
              ? 'text-text-faint cursor-not-allowed'
              : 'text-text-secondary hover:text-text-primary hover:border-accent/50 hover:bg-bg-elevated'
          }`}
        >
          {isCreating ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-border border-t-accent rounded-full animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" strokeWidth={1.75} />
              New workflow
            </>
          )}
        </button>
      </div>
    </div>
  )
}
