'use client'
import { useSessionManager } from '@/hooks/useSessionManager'
import IconRail from './IconRail'
import Sidebar from './Sidebar'
import { ChatPanel } from './ChatPanel'
import { CanvasPanel } from './CanvasPanel'

export default function DashboardShell() {
  const {
    sessions,
    activeSession,
    activeSessionId,
    isLoading,
    isSending,
    isCreating,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    updateWorkflow,
  } = useSessionManager()

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      <IconRail />
      <Sidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={selectSession}
        onNewSession={createSession}
        onDeleteSession={deleteSession}
        isCreating={isCreating}
      />
      <ChatPanel
        session={activeSession}
        isLoading={isLoading}
        isSending={isSending}
        onSend={sendMessage}
      />
      <CanvasPanel
        workflow={activeSession?.react_flow ?? { nodes: [], edges: [] }}
        onWorkflowChange={updateWorkflow}
      />
    </div>
  )
}
