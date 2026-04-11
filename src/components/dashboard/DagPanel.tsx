'use client'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'

interface DagPanelProps {
  reactFlowData: { nodes: any[]; edges: any[] }
}

export function DagPanel({ reactFlowData }: DagPanelProps) {
  if (!reactFlowData || reactFlowData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-2xl mb-2">Workflow will appear here</div>
          <div className="text-sm">After your first query with connected tools</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={reactFlowData.nodes}
        edges={reactFlowData.edges}
        fitView
        style={{ background: '#f8f9fa' }}
      >
        <Background color="#e0e0e0" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.status === 'pending') return '#ffc107'
            if (node.data?.status === 'running') return '#17a2b8'
            if (node.data?.status === 'completed') return '#28a745'
            return '#6c757d'
          }}
        />
      </ReactFlow>
    </div>
  )
}
