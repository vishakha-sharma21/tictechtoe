export interface Workflow {
  id: string
  name: string
  icon: string
  nodes: number
  status: 'running' | 'done' | 'idle'
  elapsed: string
}

export interface WorkflowNode {
  id: string
  name: string
  tool: string
  desc: string
  status: 'done' | 'running' | 'idle'
  ms?: number
  parallel?: boolean
}

export interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  workflow?: Workflow
}

export interface Tool {
  id: string
  name: string
  icon: string
  description: string
  category: string
}
