import React from 'react'

export function IconRail() {
  return (
    <div className="w-13 bg-surface border-r border-border flex flex-col items-center py-4">
      {/* Workflows Icon - Active */}
      <button className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center mb-2 text-text-primary">
        ⚡
      </button>

      {/* Separator */}
      <div className="w-8 h-px bg-border my-2" />

      {/* Recipes Icon */}
      <button className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-text-muted hover:bg-muted-surface transition-colors">
        📋
      </button>

      {/* Connections Icon */}
      <button className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-text-muted hover:bg-muted-surface transition-colors">
        🔌
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings Icon */}
      <button className="w-9 h-9 rounded-lg flex items-center justify-center mb-2 text-text-muted hover:bg-muted-surface transition-colors">
        ⚙️
      </button>

      {/* User Avatar */}
      <div className="w-7 h-7 bg-text-primary rounded flex items-center justify-center text-xs font-mono text-paper">
        JD
      </div>
    </div>
  )
}
