'use client'

import React, { useState } from 'react'
import { ChatMessage } from './ChatMessage'
import { WorkflowCard } from './WorkflowCard'

export function ChatPanel() {
  const [message, setMessage] = useState('')

  return (
    <div className="w-105 bg-surface border-r border-border flex flex-col">
      {/* Top Bar */}
      <div className="h-13 bg-white border-b border-border flex items-center justify-between px-4">
        <div className="text-sm text-text-muted">
          Workflows / <span className="text-text-primary font-medium">GitHub issue from Sentry</span>
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
        {/* Date Separator */}
        <div className="text-center">
          <span className="text-xs font-mono text-text-muted bg-surface px-2 py-1 rounded">
            Today
          </span>
        </div>

        {/* User Message */}
        <div className="flex justify-end">
          <div className="max-w-xs bg-paper border border-border rounded-lg p-3 rounded-tr-none">
            <p className="text-sm text-text-primary">
              Create a GitHub issue from the latest Sentry errors and notify the team in Slack
            </p>
          </div>
        </div>

        {/* AI Message with Workflow Card */}
        <div className="flex gap-3">
          <div className="w-6.5 h-6.5 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper flex-shrink-0">
            dg
          </div>
          <div className="flex-1">
            <div className="bg-white border border-border rounded-lg p-3 rounded-tl-none mb-3">
              <p className="text-sm text-text-primary mb-3">
                I'll help you create a workflow that monitors Sentry errors and automatically creates GitHub issues with team notifications.
              </p>
              <WorkflowCard />
            </div>
          </div>
        </div>

        {/* More messages would go here */}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="bg-white border border-border rounded-lg p-3 focus-within:border-text-muted focus-within:ring-2 focus-within:ring-text-muted focus-within:ring-opacity-20">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
            <button className="px-3 py-1.5 bg-text-primary text-paper rounded text-sm font-medium hover:bg-text-secondary transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
