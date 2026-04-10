'use client'

interface ConnectToolCardProps {
  tool: string
  user_id: string
  session_id: string
}

export function ConnectToolCard({ tool, user_id, session_id }: ConnectToolCardProps) {
  const handleConnect = () => {
    if (tool === 'github') {
      window.location.href = `/api/oauth/github/connect?user_id=${user_id}&session_id=${session_id}`
    }
    // Add other tools here as needed
  }

  const getToolInfo = (toolName: string) => {
    switch (toolName) {
      case 'github':
        return {
          icon: '???',
          name: 'Connect GitHub',
          scopes: 'repo, read:user, user:email'
        }
      default:
        return {
          icon: '?',
          name: `Connect ${toolName}`,
          scopes: 'Required permissions'
        }
    }
  }

  const toolInfo = getToolInfo(tool)

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 my-2 max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{toolInfo.icon}</span>
        <span className="text-white font-medium">{toolInfo.name}</span>
      </div>
      <p className="text-gray-400 text-sm mb-3">
        Required: {toolInfo.scopes}
      </p>
      <button
        onClick={handleConnect}
        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Connect {tool.charAt(0).toUpperCase() + tool.slice(1)} ?
      </button>
    </div>
  )
}
