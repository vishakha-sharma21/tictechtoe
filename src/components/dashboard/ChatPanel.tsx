'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import { WorkflowCard } from './WorkflowCard'
import { ConnectToolCard } from './ConnectToolCard'
import ConnectGithubCard from '../ConnectGithubCard'

interface ChatPanelProps {
  session: {
    _id: string
    session_id: string
    title: string
    query: string
    chat_history: {
      role: 'human' | 'agent' | 'tool_connect'
      content: string
      timestamp: string
      tool?: string
      id?: string
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
  onSend: (content: string) => void
  onSendComplete?: () => void
}

export function ChatPanel({ session, isLoading, isSending, onSend, onSendComplete }: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [session?.chat_history])

  // Optional: Add any completion logic here if needed
  // useEffect(() => {
  //   if (!isSending) {
  //     onSendComplete?.()
  //   }
  // }, [isSending, onSendComplete])

  return (
    <div className="w-105 bg-surface border-r border-border flex flex-col">
      {/* Top Bar */}
      <div className="h-13 bg-white border-b border-border flex items-center justify-between px-4">
        <div className="text-sm text-text-muted">
          Workflows / <span className="text-text-primary font-medium">{session?.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
            📋
          </button>
          <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
            ⬡
          </button>
          <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
            ←
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a0a0a]"></div>
          </div>
        ) : (session?.chat_history?.length ?? 0) === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#888] text-sm">Describe a task to get started.</p>
          </div>
        ) : (
          <>
            {session?.chat_history.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'human' ? 'justify-end' : ''}`}>
                {msg.role === 'human' ? (
                  <>
                    <div className="flex-1">
                      <div className="bg-text-primary text-white rounded-lg p-3 rounded-tr-none">
                        <p className="text-sm text-text-primary">{msg.content}</p>
                      </div>
                    </div>
                    <div className="w-6.5 h-6.5 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper flex-shrink-0">
                      dg
                    </div>
                  </>
                ) : msg.role === 'agent' ? (
                  <>
                    <div className="w-6.5 h-6.5 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper flex-shrink-0">
                      dg
                    </div>
                    <div className="flex-1">
                      <div className="bg-white border border-border rounded-lg p-3 rounded-tl-none">
                        <p className="text-sm text-text-primary">{msg.content}</p>
                      </div>
                    </div>
                  </>
                ) : msg.role === 'tool_connect' && msg.tool === 'github' ? (
                  <>
                    <div className="w-6.5 h-6.5 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper flex-shrink-0">
                      dg
                    </div>
                    <div className="flex-1">
                      <ConnectGithubCard 
                        user_id={session.user_id || 'u001'}
                        session_id={session.session_id || ''}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            ))}
            
            {/* ConnectToolCards for missing tools */}
            {session?.missing_tools && session.missing_tools.length > 0 && session.user_id && session.session_id && (
              <div className="flex gap-3">
                <div className="w-6.5 h-6.5 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper flex-shrink-0">
                  dg
                </div>
                <div className="flex-1 space-y-2">
                  {session.missing_tools.map((tool) => (
                    <ConnectToolCard
                      key={tool}
                      tool={tool}
                      user_id={session.user_id!}
                      session_id={session.session_id!}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Thinking indicator */}
            {isSending && (
              <div className="flex gap-3">
                <div className="w-6.5 h-6.5 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper flex-shrink-0">
                  dg
                </div>
                <div className="flex-1">
                  <div className="bg-white border border-border rounded-lg p-3 rounded-tl-none">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#888] rounded-full animate-pulse"></div>
                      <p className="text-sm text-text-primary">Thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="bg-white border border-border rounded-lg p-3 focus-within:border-text-muted focus-within:ring-2 focus-within:ring-text-muted focus-within:ring-opacity-20">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (message.trim()) {
                  onSend(message)
                  setMessage('') // Clear immediately after sending
                }
              }
            }}
            placeholder="Describe what you want to build..."
            className="w-full resize-none outline-none text-sm text-text-primary placeholder-text-muted"
            rows={1}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                📎
              </button>
              <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                📋
              </button>
              <button className="p-1.5 text-text-muted hover:text-text-primary transition-colors">
                🔌
              </button>
            </div>
            <button 
              onClick={() => {
                if (message.trim()) {
                  onSend(message)
                  setMessage('')
                }
              }}
              className="px-3 py-1.5 bg-text-primary text-paper rounded text-sm font-medium hover:bg-text-secondary transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
