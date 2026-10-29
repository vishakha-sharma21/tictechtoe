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
import LlmKeyModal from './LlmKeyModal'

export default function DashboardShell() {
  const [integrationsOpen, setIntegrationsOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatOpen, setChatOpen] = useState(true)
  const [dagOpen, setDagOpen] = useState(true)
  const [llmModalOpen, setLlmModalOpen] = useState(false)
  const [hasLlmKey, setHasLlmKey] = useState<boolean | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
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

  // Surface connector errors (?error=github_not_configured etc.) instead of failing silently.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (!err) return
    const m = err.match(/^(github|google|discord)_(not_configured|invalid_state|token_failed)$/)
    const name = m ? m[1][0].toUpperCase() + m[1].slice(1) : null
    setNotice(
      m?.[2] === 'not_configured'
        ? `${name} isn't set up on this server yet — add its client ID and secret to .env.local, then restart.`
        : m?.[2] === 'invalid_state'
        ? `${name} connection expired or was tampered with. Please try Connect again.`
        : m?.[2] === 'token_failed'
        ? `${name} refused the authorization. Check the client secret and redirect URI, then try again.`
        : `Connection failed (${err}).`
    )
    window.history.replaceState({}, '', '/dashboard')
  }, [])

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

  // First-run gate: no AI key on file → ask for one. Other code can also request the modals via events.
  useEffect(() => {
    fetch('/api/llm-keys', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setHasLlmKey(Boolean(d.hasKey))
        if (!d.hasKey) setLlmModalOpen(true)
      })
      .catch(() => {})
    const openLlm = () => setLlmModalOpen(true)
    const openIntegrations = () => setIntegrationsOpen(true)
    window.addEventListener('dagent:open-llm-keys', openLlm)
    window.addEventListener('dagent:open-integrations', openIntegrations)
    return () => {
      window.removeEventListener('dagent:open-llm-keys', openLlm)
      window.removeEventListener('dagent:open-integrations', openIntegrations)
    }
  }, [])

  const oauthSessionId = activeSession?.session_id || activeSessionId || 'integrations'

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base text-text-primary">
      {notice && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[120] max-w-lg rounded-lg border border-border-emphasis bg-bg-elevated px-4 py-2.5 text-sm text-text-primary shadow-xl flex items-start gap-3">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-text-secondary hover:text-text-primary" aria-label="Dismiss">✕</button>
        </div>
      )}
      <LlmKeyModal
        open={llmModalOpen}
        required={hasLlmKey === false}
        onClose={() => setLlmModalOpen(false)}
        onChange={setHasLlmKey}
      />
      <IconRail onOpenIntegrations={() => setIntegrationsOpen(true)} onOpenLlmKeys={() => setLlmModalOpen(true)} />
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
