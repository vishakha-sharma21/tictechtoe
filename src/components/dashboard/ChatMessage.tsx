import React from 'react'
import { ChatMessage as ChatMessageType } from '@/types'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-3`}>
      {!isUser && (
        <div className="w-6.5 h-6.5 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper flex-shrink-0">
          dg
        </div>
      )}
      
      <div className={`max-w-xs ${isUser ? 'bg-paper border border-border rounded-tr-none' : 'bg-white border border-border rounded-tl-none'} rounded-lg p-3`}>
        <p className="text-sm text-text-primary">
          {message.content}
        </p>
      </div>
    </div>
  )
}
