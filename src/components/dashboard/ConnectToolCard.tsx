'use client'

interface ConnectToolCardProps {
  tool: string
  user_id: string
  session_id: string
}

export function ConnectToolCard({ tool, user_id, session_id }: ConnectToolCardProps) {
  const handleConnect = () => {
    const sid = encodeURIComponent(session_id)
    if (tool === 'github') window.location.href = `/api/oauth/github/connect?session_id=${sid}`
    if (tool === 'google') window.location.href = `/api/oauth/google/connect?session_id=${sid}`
    if (tool === 'discord') window.location.href = '/api/oauth/discord'
  }

  const getToolInfo = (toolName: string) => {
    switch (toolName) {
      case 'github':
        return {
          icon: '🐙',
          name: 'GitHub',
          scopes: 'repo, read:user, user:email',
        }
      case 'google':
        return { icon: '📧', name: 'Google (Gmail & Drive)', scopes: 'gmail, drive, contacts' }
      case 'discord':
        return { icon: '🎮', name: 'Discord', scopes: 'identify, guilds, bot' }
      default:
        return {
          icon: '🔌',
          name: toolName,
          scopes: 'Required permissions',
        }
    }
  }

  const toolInfo = getToolInfo(tool)

  return (
    <div className="rounded-large-card border border-border bg-bg-elevated p-4 animate-slide-in w-full max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{toolInfo.icon}</span>
        <span className="text-text-primary font-medium">Connect {toolInfo.name}</span>
      </div>
      <p className="text-text-secondary text-xs mb-3 font-mono">Required: {toolInfo.scopes}</p>
      <button
        type="button"
        onClick={handleConnect}
        className="w-full bg-accent text-white font-medium py-2.5 px-4 rounded-lg text-sm hover:scale-[1.02] transition-transform duration-200"
      >
        Connect {tool.charAt(0).toUpperCase() + tool.slice(1)} →
      </button>
    </div>
  )
}
