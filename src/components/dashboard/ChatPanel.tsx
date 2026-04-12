'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Save,
  Share2,
  ArrowLeft,
  Paperclip,
  ClipboardList,
  Plug,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
} from 'lucide-react'
import ConnectGithubCard from './ConnectGithubCard'
import { ConnectToolCard } from './ConnectToolCard'
import { ExecuteConfirmCard } from './ExecuteConfirmCard'
import { WorkflowShareModal } from './WorkflowShareModal'
import { useUser } from '@/hooks/useUser'

interface ChatPanelProps {
  session: {
    _id: string
    session_id: string
    title: string
    query: string
    chat_history: {
      role: 'human' | 'agent' | 'tool_connect' | 'agent_plan' | 'card'
      content: string
      timestamp: string
      tool?: string
      id?: string
      type?: string
    }[]
    react_flow: { nodes: any[]; edges: any[] }
    completed: boolean
    created_at: string
    updated_at: string
    missing_tools?: string[]
    user_id?: string
  } | null
  isLoading: boolean
  isSending: boolean
  isExecuting?: boolean
  onSend: (content: string) => void
  onSendComplete?: () => void
  handleExecute?: () => void
  awaitingConfirm?: boolean
  panelOpen?: boolean
  onTogglePanel?: () => void
}

function AgentAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-[10px] font-mono font-bold text-text-secondary shrink-0">
      dg
    </div>
  )
}

export function ChatPanel({
  session,
  isLoading,
  isSending,
  isExecuting,
  onSend,
  handleExecute,
  awaitingConfirm,
  panelOpen = true,
  onTogglePanel,
}: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const [titleDraft, setTitleDraft] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { session: authSession } = useUser()
  const userId = authSession?.user?.userId || session?.user_id || 'unknown'

  useEffect(() => {
    if (session?.title != null) setTitleDraft(session.title)
  }, [session?.title, session?._id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.chat_history, isSending, awaitingConfirm])

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const max = 22 * 4
    ta.style.height = `${Math.min(ta.scrollHeight, max)}px`
  }, [message])

  const saveTitle = async () => {
    if (!session?._id || !titleDraft.trim()) return
    if (titleDraft === session.title) {
      setEditingTitle(false)
      return
    }
    try {
      await fetch(`/api/chats/${session._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleDraft.trim() }),
      })
    } catch {
      /* ignore */
    }
    setEditingTitle(false)
  }

  const renderAgentContent = (content: string, idx: number) => {
    if (content.startsWith('📋 Plan')) {
      const lines = content.split('\n').filter(Boolean)
      return (
        <div
          className="text-sm text-text-primary border-l-2 border-accent/50 pl-3 space-y-1.5 animate-slide-in opacity-0"
          style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'forwards' }}
        >
          {lines.map((line, i) => (
            <p key={i} className={i === 0 ? '' : 'font-mono text-[13px] text-text-secondary'}>
              {line}
            </p>
          ))}
        </div>
      )
    }
    if (content.includes('✅') || content.includes('❌')) {
      const lines = content.split('\n').filter((l) => l.trim())
      return (
        <div className="space-y-1">
          {lines.map((line, li) => (
            <p
              key={li}
              className={`text-[13px] font-mono animate-slide-in opacity-0 ${
                line.includes('❌') ? 'text-accent-red' : 'text-accent-green'
              }`}
              style={{ animationDelay: `${li * 80}ms`, animationFillMode: 'forwards' }}
            >
              {line}
            </p>
          ))}
        </div>
      )
    }
    return (
      <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap font-mono text-[13px] text-text-secondary">
        {content}
      </p>
    )
  }

  if (!panelOpen) {
    return (
      <div className="w-12 min-w-[48px] max-w-[48px] shrink-0 border-r border-border bg-bg-base flex flex-col items-center py-3 gap-3 transition-all duration-300 ease-out overflow-hidden">
        {onTogglePanel && (
          <button
            type="button"
            onClick={onTogglePanel}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            title="Expand chat"
            aria-label="Expand chat panel"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          </button>
        )}
        <MessageSquare className="w-4 h-4 text-text-secondary" strokeWidth={1.5} aria-hidden />
      </div>
    )
  }

  return (
    <div className="w-105 min-w-[420px] max-w-[420px] bg-bg-base border-r border-border flex flex-col shrink-0 transition-all duration-300 ease-out overflow-hidden">
      <header className="h-14 shrink-0 border-b border-border bg-bg-surface px-2 sm:px-4 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          {editingTitle ? (
            <input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  saveTitle()
                }
              }}
              className="w-full bg-bg-elevated border border-border rounded-lg px-2 py-1 text-sm text-text-primary outline-none focus:border-accent focus:shadow-glow-sm"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="text-left w-full truncate font-medium text-text-primary hover:text-accent transition-colors"
            >
              {session?.title || 'Workflow'}
            </button>
          )}
          <p className="text-[11px] text-text-faint truncate mt-0.5">
            Workflows / <span className="text-text-secondary">{session?.title || '…'}</span>
          </p>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {onTogglePanel && (
            <button
              type="button"
              title="Collapse chat"
              onClick={onTogglePanel}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              aria-label="Collapse chat panel"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
            </button>
          )}
          <button
            type="button"
            title="Save title"
            onClick={saveTitle}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Share workflow"
            onClick={() => setShareOpen(true)}
            disabled={!session?._id}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors disabled:opacity-40"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <Link
            href="/"
            title="Back to home"
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {session && (
        <WorkflowShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          chatId={session._id}
          title={session.title}
          reactFlow={session.react_flow || { nodes: [], edges: [] }}
        />
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        ) : (session?.chat_history?.length ?? 0) === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-secondary text-sm">Describe a task to get started.</p>
          </div>
        ) : (
          <>
            {session?.chat_history.map((msg, idx) => {
              if (msg.role === 'human') {
                return (
                  <div
                    key={idx}
                    className="flex justify-end gap-2 animate-slide-in opacity-0"
                    style={{ animationDelay: `${idx * 30}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-bg-elevated border border-border px-4 py-2.5">
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )
              }

              if (msg.role === 'tool_connect' && msg.tool === 'github') {
                return (
                  <div key={idx} className="w-full pl-0">
                    <ConnectGithubCard
                      user_id={userId}
                      session_id={session.session_id || ''}
                    />
                  </div>
                )
              }

              
              if (msg.role === 'agent') {
                return (
                  <div key={idx} className="flex gap-3 items-start">
                    <AgentAvatar />
                    <div className="flex-1 min-w-0 pt-0.5">{renderAgentContent(msg.content, idx)}</div>
                  </div>
                )
              }

              return null
            })}

            {awaitingConfirm && handleExecute && (
              <div className="w-full">
                <ExecuteConfirmCard
                  onExecute={handleExecute}
                  isExecuting={isExecuting || false}
                  onCancel={() => onSend('cancel')}
                />
              </div>
            )}

            {session?.missing_tools && session.missing_tools.length > 0 && session.user_id && session.session_id && (
              <div className="space-y-2 w-full">
                {session.missing_tools.map((tool) => (
                  <ConnectToolCard
                    key={tool}
                    tool={tool}
                    user_id={session.user_id!}
                    session_id={session.session_id!}
                  />
                ))}
              </div>
            )}

            {isSending && (
              <div className="flex gap-3 items-start">
                <AgentAvatar />
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Thinking…
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-border bg-bg-surface shrink-0">
        <div className="rounded-xl border border-border bg-bg-elevated focus-within:border-accent focus-within:shadow-glow-sm transition-all duration-200 p-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !(e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                if (message.trim() && !isSending) {
                  onSend(message)
                  setMessage('')
                }
              }
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                if (message.trim() && !isSending) {
                  onSend(message)
                  setMessage('')
                }
              }
            }}
            placeholder="Describe what you want to build…"
            rows={1}
            className="w-full resize-none outline-none text-sm text-text-primary placeholder:text-text-faint bg-transparent max-h-[88px]"
            disabled={isSending}
          />
          <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-text-faint">
              <button type="button" className="p-2 rounded-lg hover:bg-bg-base hover:text-text-secondary transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-lg hover:bg-bg-base hover:text-text-secondary transition-colors">
                <ClipboardList className="w-4 h-4" />
              </button>
              <button type="button" className="p-2 rounded-lg hover:bg-bg-base hover:text-text-secondary transition-colors">
                <Plug className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-text-faint hidden sm:inline">⌘ + Enter to send</span>
              <button
                type="button"
                disabled={isSending || !message.trim()}
                onClick={() => {
                  if (message.trim()) {
                    onSend(message)
                    setMessage('')
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Sending
                  </>
                ) : (
                  <>Send →</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
