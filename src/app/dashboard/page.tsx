import React from 'react'
import { IconRail } from '@/components/dashboard/IconRail'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ChatPanel } from '@/components/dashboard/ChatPanel'
import { CanvasPanel } from '@/components/dashboard/CanvasPanel'

export default function DashboardPage() {
  return (
    <div className="h-screen bg-paper flex">
      {/* Icon Rail */}
      <IconRail />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Chat Panel */}
      <ChatPanel />
      
      {/* Canvas Panel */}
      <CanvasPanel />
    </div>
  )
}
