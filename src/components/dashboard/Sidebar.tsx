'use client'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'

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
}

export default function Sidebar({ sessions, activeId, onSelect, onNewSession, onDeleteSession, isCreating }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div className={`border-r border-[#e0ddd6] bg-[#f3f2ef] flex flex-col transition-all duration-200
      ${collapsed ? 'w-[52px]' : 'w-[260px]'}`}
    >
      {/* Toggle */}
      <div className="flex items-center justify-end p-2 border-b border-[#e0ddd6]">
        <button
          onClick={() => setCollapsed(p => !p)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#888] hover:bg-[#eae9e4] transition-colors"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Search â hide when collapsed */}
      {!collapsed && (
        <div className="p-3">
          <input
            className="w-full px-2.5 py-2 bg-white border border-[#e0ddd6] rounded-lg text-[12px] text-[#0a0a0a] placeholder-[#bbb] outline-none focus:border-[#0a0a0a]"
            placeholder="Search workflowsâ¦"
          />
        </div>
      )}

      {!collapsed && (
        <p className="px-4 pb-2 font-mono text-[10px] tracking-widest text-[#bbb] uppercase">
          Workflows
        </p>
      )}

      {/* Workflow list */}
      <div className="flex-1 overflow-y-auto px-2 flex flex-col gap-1">
        {sessions.length === 0 && !collapsed && (
          <div className="text-center py-4">
            <p className="text-[#888] text-xs">No workflows yet</p>
          </div>
        )}
        {sessions.map(session => (
          <div
            key={session._id}
            className={`group relative rounded-lg transition-all
              ${activeId === session._id
                ? 'bg-white border border-[#e0ddd6]'
                : 'hover:bg-[#eae9e4]'
              }`}
          >
            {confirmingId === session._id ? (
              <div className="flex items-center gap-2 px-2 py-2">
                <button
                  onClick={async () => {
                    setDeletingId(session._id)
                    await onDeleteSession(session._id)
                    setDeletingId(null)
                    setConfirmingId(null)
                  }}
                  disabled={deletingId === session._id}
                  className="flex-1 text-[11px] text-[#dc2626] hover:bg-[#fef2f2] px-1 py-0.5 rounded transition-colors disabled:opacity-50"
                >
                  {deletingId === session._id ? 'Deleting...' : 'Confirm delete'}
                </button>
                <button
                  onClick={() => setConfirmingId(null)}
                  disabled={deletingId === session._id}
                  className="flex-1 text-[11px] text-[#888] hover:bg-[#eae9e4] px-1 py-0.5 rounded transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                onClick={() => onSelect(session._id)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-2 w-full text-left transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#eae9e4] border border-[#e0ddd6] flex items-center justify-center flex-shrink-0">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-[#0a0a0a] truncate">{session.title}</p>
                    <p className="text-[10px] font-mono text-[#888]">{session.chat_history?.length || 0} messages · {new Date(session.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
                {!collapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setConfirmingId(session._id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#888] hover:text-[#dc2626] transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New workflow */}
      <div className="p-2 border-t border-[#e0ddd6]">
        <button
          onClick={onNewSession}
          disabled={isCreating}
          className={`w-full flex items-center justify-center gap-2 border border-dashed border-[#ccc9c0] rounded-lg py-2 text-[12px] transition-all
            ${isCreating 
              ? 'text-[#888] cursor-not-allowed' 
              : 'text-[#888] hover:text-[#0a0a0a] hover:border-[#0a0a0a]'
            }`}
        >
          {isCreating ? (
            <>
              <div className="w-3 h-3 border border-[#888] border-t-transparent rounded-full animate-spin"></div>
              {!collapsed && 'Creating...'}
            </>
          ) : (
            <>
              <Plus size={13} />
              {!collapsed && 'New workflow'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
