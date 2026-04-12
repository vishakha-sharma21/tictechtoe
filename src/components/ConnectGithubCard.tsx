'use client'

interface ConnectGithubCardProps {
  user_id: string
  session_id: string
  onSuccess?: () => void
}

export default function ConnectGithubCard({ user_id, session_id, onSuccess }: ConnectGithubCardProps) {
  const handleConnect = () => {
    // Save to localStorage for OAuth retry
    localStorage.setItem('dagent_last_query', localStorage.getItem('dagent_current_query') || '')
    localStorage.setItem('dagent_last_session', session_id)
    localStorage.setItem('dagent_user_id', user_id)

    // Redirect to GitHub OAuth
    window.location.href = `/api/oauth/github/connect?user_id=${user_id}&session_id=${session_id}`
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-6 max-w-sm mx-auto my-4 shadow-2xl backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        <div>
          <span className="text-white font-semibold text-lg">GitHub</span>
          <p className="text-gray-400 text-xs">Required for repository operations</p>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-4 mb-4 border border-gray-700/30">
        <p className="text-gray-300 mb-3 text-sm font-medium">Connect your GitHub account to continue.</p>

        <div className="space-y-2">
          <p className="text-gray-400 text-xs font-medium">Access requested:</p>
          <ul className="space-y-1">
            <li className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
              <span>repo - full control of repositories</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              <span>delete_repo - delete repositories</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-1 h-1 bg-green-400 rounded-full"></span>
              <span>read:user - your profile data</span>
            </li>
            <li className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
              <span>user:email - your email address</span>
            </li>
          </ul>
        </div>
      </div>

      <button
        onClick={handleConnect}
        className="w-full bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border border-gray-700/50 shadow-lg"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
        </svg>
        <span>Connect GitHub</span>
      </button>
    </div>
  )
}
