'use client'
import { useState, useEffect, useCallback } from 'react'

export interface Message {
  role: 'human' | 'agent'
  content: string
  timestamp: string
}

export interface ChatSession {
  _id: string
  session_id: string
  title: string
  query: string
  chat_history: Message[]
  react_flow: { nodes: any[]; edges: any[] }
  completed: boolean
  created_at: string
  updated_at: string
}

export function useSessionManager() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Load sidebar session list
  const loadSessions = useCallback(async () => {
    const res = await fetch('/api/chats')
    const data = await res.json()
    setSessions(data.chats ?? [])
    // Auto-select first session or create one if none exist
    if (data.chats?.length > 0) {
      selectSession(data.chats[0]._id)
    } else {
      createSession()
    }
  }, [])

  // Load a single session's full data
  const selectSession = useCallback(async (id: string) => {
    setActiveSessionId(id)
    setIsLoading(true)
    const res = await fetch(`/api/chats/${id}`)
    const data = await res.json()
    setActiveSession(data)
    setIsLoading(false)
  }, [])

  // Create a new session
  const createSession = useCallback(async () => {
    if (isCreating) return // Prevent duplicate calls
    setIsCreating(true)
    
    try {
      const res = await fetch('/api/chats/new', { method: 'POST' })
      const data = await res.json()
      
      // Load the full session data
      await selectSession(data._id)
      // Refresh the sessions list
      await loadSessions()
    } catch (error) {
      console.error('Error creating session:', error)
    } finally {
      setIsCreating(false)
    }
  }, [isCreating, loadSessions, selectSession])

  // Delete a session
  const deleteSession = useCallback(async (id: string) => {
    try {
      await fetch(`/api/chats/${id}`, { method: 'DELETE' })
      
      // Remove from local state
      setSessions(prev => prev.filter(s => s._id !== id))
      
      // If deleting active session, select another or create new one
      if (activeSessionId === id) {
        const remainingSessions = sessions.filter(s => s._id !== id)
        if (remainingSessions.length > 0) {
          await selectSession(remainingSessions[0]._id)
        } else {
          await createSession()
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }, [activeSessionId, sessions, selectSession, createSession])

  // Send a message â persists user message, calls agent, persists response
  const sendMessage = useCallback(async (content: string) => {
    if (!activeSessionId) return
    setIsSending(true)

    // 1. Optimistic UI update
    const userMsg: Message = { role: 'human', content, timestamp: new Date().toISOString() }
    setActiveSession(prev => prev
      ? { ...prev, chat_history: [...(prev.chat_history || []), userMsg] }
      : prev
    )

    // 2. Update query and persist user message
    const updatedHistory = activeSession ? [...(activeSession.chat_history || []), userMsg] : [userMsg]
    await fetch(`/api/chats/${activeSessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        query: content,
        chat_history: updatedHistory
      }),
    })

    // 3. Call your planner/agent API (replace URL with your actual endpoint)
    let agentContent = 'Workflow planned successfully.'
    try {
      const agentRes = await fetch('/api/agent/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content, sessionId: activeSessionId }),
      })
      const agentData = await agentRes.json()
      agentContent = agentData.response ?? agentContent
    } catch {}

    // 4. Persist agent response
    const agentMsg: Message = { role: 'agent', content: agentContent, timestamp: new Date().toISOString() }
    const finalHistory = [...updatedHistory, agentMsg]
    await fetch(`/api/chats/${activeSessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_history: finalHistory }),
    })

    // 5. Update UI with agent response
    setActiveSession(prev => prev
      ? { ...prev, chat_history: finalHistory }
      : prev
    )

    // 6. Refresh sidebar list (updated_at order)
    setSessions(prev => prev.map(s =>
      s._id === activeSessionId
        ? { ...s, updated_at: new Date().toISOString() }
        : s
    ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()))

    setIsSending(false)
  }, [activeSessionId, activeSession])

  // Update workflow in DB
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
  }
}
