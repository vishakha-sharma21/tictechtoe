'use client'
import { useSessionManager } from '@/hooks/useSessionManager'
import { useEffect } from 'react'
import IconRail from './IconRail'
import Sidebar from './Sidebar'
import { ChatPanel } from './ChatPanel'
import { CanvasPanel } from './CanvasPanel'

export default function DashboardShell() {
  const {
    sessions,
    activeSessionId,
    activeSession,
    isLoading,
    isSending,
    isCreating,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    updateWorkflow,
  } = useSessionManager()

  // Auto-retry logic for OAuth return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reconnect = params.get("reconnect")
    const returnedSession = params.get("session_id")

    if (reconnect === "true" && returnedSession) {
      // Clean URL immediately
      window.history.replaceState({}, "", "/dashboard")

      // Retrieve saved query
      const lastQuery = localStorage.getItem("dagent_last_query")
      const lastSession = localStorage.getItem("dagent_last_session")

      if (lastQuery && lastSession) {
        localStorage.removeItem("dagent_last_query")
        localStorage.removeItem("dagent_last_session")

        // Auto-fire the query again
        setTimeout(() => {
          sendMessage(lastQuery)
        }, 1000) // Small delay to ensure session is loaded
      }
    }
  }, [sendMessage])

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
        onSendComplete={() => {
          // Optional: Add any completion logic here
        }}
      />
      <CanvasPanel
        workflow={activeSession?.react_flow ?? { nodes: [], edges: [] }}
        onWorkflowChange={updateWorkflow}
      />
    </div>
  )
}
