import { useState, useCallback, useEffect } from 'react'
import { sanitizeNodes } from '@/lib/dagUtils'

export interface Message {
  role: 'human' | 'agent' | 'tool_connect' | 'agent_plan' | 'card'
  content: string
  timestamp: string
  tool?: string
  id?: string
  type?: string
  user_id?: string
  session_id?: string
}

export interface ChatSession {
  _id: string
  session_id: string
  title: string
  query: string
  chat_history: Message[]
  react_flow?: {
    nodes: any[]
    edges: any[]
  }
  completed?: boolean
  updated_at: string
  user_id?: string
}

export function useSessionManager() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [reactFlowData, setReactFlowData] = useState<any>({ nodes: [], edges: [] })
  const [orchMessages, setOrchMessages] = useState<Array<{role: string, content: string}>>([])

  // Append message helper
  const appendMessage = useCallback((message: Message) => {
    setActiveSession(prev => {
      if (!prev) return prev
      const newHistory = [...prev.chat_history, { ...message, timestamp: new Date().toISOString() }]
      return { ...prev, chat_history: newHistory }
    })
  }, [])

  // Load sidebar session list
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chats')
      const data = await res.json()
      setSessions(data.chats ?? [])
      if (data.chats?.length > 0) {
        selectSession(data.chats[0]._id)
      } else {
        await createSession()
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }, [])

  // Create new session
  const createSession = useCallback(async () => {
    setIsCreating(true)
    try {
      const res = await fetch('/api/chats/new', { method: 'POST' })
      const data = await res.json()
      const newSession = data.chat
      setSessions(prev => [newSession, ...prev])
      selectSession(newSession._id)
      setOrchMessages([])
    } catch (error) {
      console.error('Error creating session:', error)
    } finally {
      setIsCreating(false)
    }
  }, [])

  // Select session by ID
  const selectSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId)
    try {
      const res = await fetch(`/api/chats/${sessionId}`)
      const data = await res.json()
      setActiveSession(data.chat)
      if (data.chat?.react_flow) {
        setReactFlowData({
          nodes: sanitizeNodes(data.chat.react_flow.nodes || []),
          edges: data.chat.react_flow.edges || []
        })
      }
    } catch (error) {
      console.error('Error loading session:', error)
    }
  }, [])

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await fetch(`/api/chats/${sessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s._id !== sessionId))
      if (activeSessionId === sessionId) {
        const remaining = sessions.filter(s => s._id !== sessionId)
        if (remaining.length > 0) {
          selectSession(remaining[0]._id)
        } else {
          await createSession()
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }, [activeSessionId, sessions, selectSession, createSession])

  // Execute DAG
  const handleExecute = useCallback(async () => {
    if (!activeSessionId) return

    setIsExecuting(true)
    try {
      // Set all nodes to yellow (running) immediately
      setReactFlowData((prev: any) => ({
        ...prev,
        nodes: prev.nodes.map((node: any) => ({
          ...node,
          style: {
            background: '#eab308',
            color: 'white',
            border: '2px solid transparent',
            borderRadius: '8px'
          }
        }))
      }))

      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const userId = sessionData?.user?.userId || 'unknown'

      const res = await fetch('http://localhost:8010/execute-dag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, session_id: activeSessionId })
      })
      const data = await res.json()

      if (data.status === 'error') {
        appendMessage({
          role: 'agent',
          content: `❌ ${data.message}`,
          timestamp: new Date().toISOString()
        })
        return
      }

      // Show each result line with delay
      if (data.summary) {
        for (const line of data.summary) {
          appendMessage({
            role: 'agent',
            content: line,
            timestamp: new Date().toISOString()
          })
          await new Promise(r => setTimeout(r, 400))
        }
      }

      // Final message
      appendMessage({
        role: 'agent',
        content: data.completed
          ? '🎉 Workflow completed successfully!'
          : '⚠️ Workflow finished with some errors. Check above for details.',
        timestamp: new Date().toISOString()
      })

      // Update DAG node colors
      if (data.updated_nodes) {
        setReactFlowData((prev: any) => ({
          ...prev,
          nodes: sanitizeNodes(data.updated_nodes || [])
        }))
      }

    } catch (err) {
      appendMessage({
        role: 'agent',
        content: '❌ Execution failed. Make sure the backend is running.',
        timestamp: new Date().toISOString()
      })
      console.error('Execute error:', err)
    } finally {
      setIsExecuting(false)
    }
  }, [activeSessionId, appendMessage])

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeSessionId) return

    try {
      setIsSending(true)

      const sessionRes = await fetch('/api/auth/session')
      const sessionData = await sessionRes.json()
      const userId = sessionData?.user?.userId || 'unknown'

      // Detect confirmation words
      const CONFIRM_WORDS = ['yes', 'proceed', 'execute', 'go ahead',
        'do it', 'confirm', 'run it', 'yes please', 'sure', 'ok', 'yep', 'yeah']
      const userIsConfirming = CONFIRM_WORDS.some(w =>
        content.trim().toLowerCase().includes(w)
      )

      // If awaiting confirm and user says yes → execute
      if (awaitingConfirm && userIsConfirming) {
        appendMessage({ role: 'human', content, timestamp: new Date().toISOString() })
        appendMessage({
          role: 'agent',
          content: '⚙️ Starting execution...',
          timestamp: new Date().toISOString()
        })
        setAwaitingConfirm(false)
        // Remove execute_confirm cards
        setActiveSession(prev => {
          if (!prev) return prev
          return {
            ...prev,
            chat_history: prev.chat_history.filter(m => m.type !== 'execute_confirm')
          }
        })
        await handleExecute()
        return
      }

      // If awaiting confirm but user wants changes → reset and continue to orchestrate
      if (awaitingConfirm && !userIsConfirming) {
        setAwaitingConfirm(false)
      }

      // Append human message to chat
      appendMessage({ role: 'human', content, timestamp: new Date().toISOString() })

      // Check for missing integrations first
      const processRes = await fetch('http://localhost:8010/process-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          session_id: activeSessionId,
          query: content
        })
      })
      const processData = await processRes.json()
      console.log('📡 process-query response:', processData)

      // CASE 1: Tools missing → show connect cards
      if (processData.status === 'missing_integrations') {
        const agentMsg = `I need access to: ${processData.missing_tools.join(', ')}. Please connect them below to continue.`
        appendMessage({ role: 'agent', content: agentMsg, timestamp: new Date().toISOString() })

        // Save to DB
        await fetch('/api/chats/append', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            session_id: activeSessionId,
            messages: [
              { role: 'human', content },
              { role: 'agent', content: agentMsg }
            ]
          })
        })

        // Show connect card for each missing tool
        processData.missing_tools.forEach((tool: string) => {
          if (tool === 'github') {
            appendMessage({
              id: `connect_github_${Date.now()}`,
              type: 'tool_connect',
              role: 'card',
              tool: 'github',
              content: 'Connect GitHub to access repositories',
              user_id: userId,
              session_id: activeSessionId,
              timestamp: new Date().toISOString()
            })
          }
        })

        // Save for auto-retry after OAuth
        localStorage.setItem('dagent_last_query', content)
        localStorage.setItem('dagent_last_session', activeSessionId)
        localStorage.setItem('dagent_user_id', userId)

        return
      }

      // CASE 2: All tools ready → call orchestrate
      if (processData.status === 'ready') {
        const newOrchMessages = [...orchMessages, { role: 'user', content }]
        setOrchMessages(newOrchMessages)

        const orchRes = await fetch('http://localhost:8010/orchestrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            session_id: activeSessionId,
            messages: newOrchMessages
          })
        })

        const orchData = await orchRes.json()
        console.log('🤖 Orchestrator response:', orchData)

        // Append agent response to orch history
        setOrchMessages(prev => [...prev, {
          role: 'assistant',
          content: JSON.stringify(orchData)
        }])

        let agentContent = ''

        if (orchData.status === 'clarify') {
          agentContent = orchData.question
          appendMessage({
            role: 'agent',
            content: orchData.question,
            timestamp: new Date().toISOString()
          })
        }

        if (orchData.status === 'dag_ready') {
          agentContent = orchData.message
          appendMessage({ role: 'agent', content: orchData.message, timestamp: new Date().toISOString() })
          if (orchData.summary) {
            const planText = '📋 Plan:\n' + orchData.summary.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
            appendMessage({ role: 'agent', content: planText, timestamp: new Date().toISOString() })
            agentContent = orchData.message + '\n' + planText
          }
          if (orchData.react_flow) {
            setReactFlowData({
              nodes: sanitizeNodes(orchData.react_flow.nodes || []),
              edges: orchData.react_flow.edges || []
            })
          }
          setAwaitingConfirm(false)
        }

        if (orchData.status === 'confirm') {
          agentContent = orchData.message
          setAwaitingConfirm(true)
          appendMessage({ role: 'agent', content: orchData.message, timestamp: new Date().toISOString() })
          // Add execute confirm card
          setActiveSession(prev => {
            if (!prev) return prev
            const newHistory = [...prev.chat_history, {
              id: `confirm_${Date.now()}`,
              type: 'execute_confirm',
              role: 'card' as const,
              content: '',
              timestamp: new Date().toISOString()
            }]
            return { ...prev, chat_history: newHistory }
          })
        }

        if (orchData.status === 'message') {
          agentContent = orchData.message
          appendMessage({ role: 'agent', content: orchData.message, timestamp: new Date().toISOString() })
        }

        // Save both messages to DB
        await fetch('/api/chats/append', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            session_id: activeSessionId,
            messages: [
              { role: 'human', content },
              { role: 'agent', content: agentContent }
            ]
          })
        })
      }

    } catch (error) {
      console.error('Error in sendMessage:', error)
      appendMessage({
        role: 'agent',
        content: `❌ ${(error as Error).message}`,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsSending(false)
    }
  }, [activeSessionId, awaitingConfirm, orchMessages, handleExecute, appendMessage])

  // Update workflow
  const updateWorkflow = useCallback(async (nodes: any[], edges: any[]) => {
    if (!activeSessionId) return
    await fetch(`/api/chats/${activeSessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ react_flow: { nodes, edges } }),
    })
    setActiveSession(prev => prev ? { ...prev, react_flow: { nodes, edges } } : prev)
  }, [activeSessionId])

  useEffect(() => { loadSessions() }, [loadSessions])

  return {
    sessions,
    activeSessionId,
    activeSession,
    isLoading,
    isSending,
    isCreating,
    isExecuting,
    awaitingConfirm,
    reactFlowData,
    createSession,
    selectSession,
    deleteSession,
    sendMessage,
    updateWorkflow,
    handleExecute,
  }
}