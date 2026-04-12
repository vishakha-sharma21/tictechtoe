'use client'
import { useSessionManager } from '@/hooks/useSessionManager'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import IconRail from './IconRail'
import Sidebar from './Sidebar'
import { ChatPanel } from './ChatPanel'
import { DagPanel } from './DagPanel'
import { IntegrationsSlideover } from './IntegrationsSlideover'

export default function DashboardShell() {
  const [integrationsOpen, setIntegrationsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)
  const [dagOpen, setDagOpen] = useState(true)
  const { data: authSession } = useSession()
  const authUserId = authSession?.user?.userId || ''

  const {
    sessions,
    activeSessionId,
    activeSession,
    isLoading,
    isSending,
    isCreating,
    isExecuting,
    awaitingConfirm,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    reactFlowData,
    handleExecute,
  } = useSessionManager()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reconnect = params.get('reconnect')
    const returnedSession = params.get('session_id')

    if (reconnect === 'true' && returnedSession) {
      window.history.replaceState({}, '', '/dashboard')

      const lastQuery = localStorage.getItem('dagent_last_query')
      const lastSession = localStorage.getItem('dagent_last_session')

      if (lastQuery && lastSession) {
        localStorage.removeItem('dagent_last_query')
        localStorage.removeItem('dagent_last_session')

        setTimeout(() => {
          sendMessage(lastQuery)
        }, 1000)
      }
    }
  }, [sendMessage])

  const oauthSessionId = activeSession?.session_id || activeSessionId || 'integrations'

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary">
      <IconRail onOpenIntegrations={() => setIntegrationsOpen(true)} />
      <IntegrationsSlideover
        open={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
        userId={authUserId || (activeSession as { user_id?: string } | null)?.user_id || ''}
        sessionIdForOAuth={oauthSessionId}
        authSession={authSession}
      />

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="w-6 shrink-0 flex items-center justify-center border-r border-border bg-bg-surface hover:bg-bg-elevated transition-all duration-300 ease-out text-text-secondary"
          aria-label="Expand workflows panel"
        >
          <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}

      <Sidebar
        sessions={sessions as any}
        activeId={activeSessionId}
        onSelect={selectSession}
        onNewSession={createSession}
        onDeleteSession={deleteSession}
        isCreating={isCreating}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      <ChatPanel
        session={activeSession as any}
        isLoading={isLoading}
        isSending={isSending}
        isExecuting={isExecuting}
        onSend={sendMessage}
        onSendComplete={() => {}}
        handleExecute={handleExecute}
        awaitingConfirm={awaitingConfirm}
        panelOpen={chatOpen}
        onTogglePanel={() => setChatOpen((v) => !v)}
      />

      {!dagOpen && (
        <button
          type="button"
          onClick={() => setDagOpen(true)}
          className="w-6 shrink-0 flex items-center justify-center border-l border-border bg-bg-surface hover:bg-bg-elevated transition-all duration-300 ease-out text-text-secondary"
          aria-label="Expand DAG panel"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}

      <DagPanel
        reactFlowData={reactFlowData}
        isExecuting={isExecuting}
        chatSession={activeSession as any}
        isOpen={dagOpen}
        onToggle={() => setDagOpen((v) => !v)}
      />
    </div>
  )
}
