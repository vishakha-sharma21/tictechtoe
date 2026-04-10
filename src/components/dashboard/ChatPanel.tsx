'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import { WorkflowCard } from './WorkflowCard'

interface ChatPanelProps {
  session: {
    _id: string
    session_id: string
    title: string
    query: string
    chat_history: {
      role: 'human' | 'agent'
      content: string
      timestamp: string
    }[]
    react_flow: { nodes: any[]; edges: any[] }
    completed: boolean
    created_at: string
    updated_at: string
  } | null
  isLoading: boolean
  isSending: boolean
  onSend: (content: string) => void
}

export function ChatPanel({ session, isLoading, isSending, onSend }: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [session?.chat_history])

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
            {session?.chat_history?.map((msg: any, index: number) => (
              <div key={index} className={msg.role === 'human' ? 'flex justify-end' : 'flex gap-3'}>
                {msg.role === 'human' ? (
                  <div className="max-w-xs bg-paper border border-border rounded-lg p-3 rounded-tr-none">
                    <p className="text-sm text-text-primary">{msg.content}</p>
                  </div>
                ) : (
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
                )}
              </div>
            ))}
            
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
                  setMessage('')
                }
              }
            }}
            placeholder="Describe what you want to build..."
            className="w-full resize-none outline-none text-sm text-text-primary placeholder-text-muted"
            rows={1}
            disabled={isSending}
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
              disabled={isSending}
              className="px-3 py-1.5 bg-text-primary text-paper rounded text-sm font-medium hover:bg-text-secondary transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
