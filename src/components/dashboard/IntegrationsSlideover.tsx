'use client'

import { useCallback, useEffect, useState } from 'react'
import { X } from 'lucide-react'

type ProviderRow = {
  id: string
  emoji: string
  name: string
  blurb: string
  tools: string
  connectHref?: string
  soon?: boolean
}

// SVG Icon Components
const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const GmailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.527-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
)

const GoogleDriveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
  </svg>
)

const SlackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521 2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.522 2.521A2.528 2.528 0 0 1 12.646 8.834V2.522A2.528 2.528 0 0 1 15.166 0a2.528 2.528 0 0 1 2.522 2.522v6.312zM15.166 18.956a2.528 2.528 0 0 1 2.522 2.522A2.528 2.528 0 0 1 15.166 24a2.528 2.528 0 0 1-2.52-2.522v-2.522h2.52zM15.166 17.688a2.528 2.528 0 0 1-2.52-2.522 2.528 2.528 0 0 1 2.52-2.521h6.313A2.528 2.528 0 0 1 24 15.166a2.528 2.528 0 0 1-2.522 2.522h-6.312z"/>
  </svg>
)

const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
)

const TwilioIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 20.786c-4.846 0-8.786-3.94-8.786-8.786S7.154 3.214 12 3.214 20.786 7.154 20.786 12 16.846 20.786 12 20.786zm4.214-11.143a2.143 2.143 0 1 1-4.286 0 2.143 2.143 0 0 1 4.286 0zm0 4.714a2.143 2.143 0 1 1-4.286 0 2.143 2.143 0 0 1 4.286 0zm-4.714 0a2.143 2.143 0 1 1-4.286 0 2.143 2.143 0 0 1 4.286 0zm0-4.714a2.143 2.143 0 1 1-4.286 0 2.143 2.143 0 0 1 4.286 0z"/>
  </svg>
)

const JiraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 11.429H0L5.714 0h11.429l-5.714 11.429h5.714l-5.714 11.429H0l5.714-11.429h5.714z"/>
  </svg>
)

const PROVIDERS: ProviderRow[] = [
  {
    id: 'github',
    emoji: '🐙',
    name: 'GitHub',
    blurb: 'Full control of your repositories',
    tools: '20 tools available',
  },
  {
    id: 'gmail',
    emoji: '📧',
    name: 'Gmail',
    blurb: 'Send and read email in workflows',
    tools: '20 tools available',
  },
  {
    id: 'google_drive',
    emoji: '💾',
    name: 'Google Drive',
    blurb: 'Files, Sheets and folders automation',
    tools: 'Same Google connection as Gmail',
  },
  {
    id: 'slack',
    emoji: '💬',
    name: 'Slack',
    blurb: 'Channels, messages, and alerts',
    tools: '',
    soon: true,
  },
  {
    id: 'discord',
    emoji: '🎮',
    name: 'Discord',
    blurb: 'Servers, channels, and messages',
    tools: '10 tools available',
  },
  {
    id: 'twilio',
    emoji: '📱',
    name: 'Twilio',
    blurb: 'Calls, SMS, and WhatsApp messages',
    tools: '5 tools available',
  },
  {
    id: 'jira',
    emoji: '📋',
    name: 'Jira',
    blurb: 'Issues and project tracking',
    tools: '',
    soon: true,
  },
]

interface IntegrationsSlideoverProps {
  open: boolean
  onClose: () => void
  userId: string
  sessionIdForOAuth: string
  authSession?: any
}

export function IntegrationsSlideover({
  open,
  onClose,
  userId,
  sessionIdForOAuth,
  authSession,
}: IntegrationsSlideoverProps) {
  const [connected, setConnected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/integrations/status', { cache: 'no-store' })
      const data = await res.json()
      setConnected(Array.isArray(data.connected) ? data.connected : [])
    } catch {
      setConnected([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      load()
    }
  }, [open, load])

  if (!open) return null

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        aria-label="Close integrations"
        onClick={onClose}
      />
      <aside className="fixed left-0 top-0 z-[70] h-full w-[320px] bg-bg-surface border-r border-border shadow-2xl flex flex-col animate-slide-in-left">
        <header className="flex items-start justify-between gap-3 p-4 border-b border-border">
          <div>
            <h2 className="font-display text-lg text-text-primary">Integrations</h2>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Connect your tools to use them in workflows.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading && (
            <p className="text-xs text-text-secondary px-1">Checking connections…</p>
          )}
          {PROVIDERS.map((p) => {
            const isConnected = connected.includes(p.id)
            // Gmail + Drive are both served by the single Google connector (status route maps them).
            const isGoogleConnected = false
            const sid = encodeURIComponent(sessionIdForOAuth)
            const href =
              p.id === 'github'
                ? `/api/oauth/github/connect?session_id=${sid}`
                : p.id === 'gmail' || p.id === 'google_drive'
                ? `/api/oauth/google/connect?session_id=${sid}`
                : p.id === 'discord'
                ? '/api/oauth/discord'
                : undefined

            return (
              <div
                key={p.id}
                className="rounded-large-card border border-border bg-bg-elevated p-4 hover:border-border-emphasis transition-colors duration-200"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-text-secondary">
                    {p.id === 'github' && <GithubIcon />}
                    {p.id === 'gmail' && <GmailIcon />}
                    {p.id === 'google_drive' && <GoogleDriveIcon />}
                    {p.id === 'slack' && <SlackIcon />}
                    {p.id === 'discord' && <DiscordIcon />}
                    {p.id === 'twilio' && <TwilioIcon />}
                    {p.id === 'jira' && <JiraIcon />}
                  </div>
                  <span className="font-medium text-text-primary">{p.name}</span>
                </div>
                <p className="text-xs text-text-secondary mb-3 leading-relaxed">{p.blurb}</p>
                {p.tools ? <p className="text-[11px] font-mono text-text-faint mb-3">{p.tools}</p> : null}
                {p.soon && !isGoogleConnected ? (
                  <span className="inline-flex text-[11px] px-2 py-1 rounded-full border border-border text-text-secondary">
                    Coming soon
                  </span>
                ) : p.id === 'twilio' ? (
                  <span className="inline-flex text-[11px] px-2.5 py-1 rounded-full bg-accent-green/15 text-accent-green border border-accent-green/30">
                    Active
                  </span>
                ) : isConnected || isGoogleConnected ? (
                  <span className="inline-flex text-[11px] px-2.5 py-1 rounded-full bg-accent-green/15 text-accent-green border border-accent-green/30">
                    Connected
                  </span>
                ) : (
                  <a
                    href={href}
                    className="inline-flex items-center justify-center w-full text-sm font-medium rounded-lg bg-accent text-white py-2 hover:scale-[1.02] transition-transform duration-200"
                  >
                    Connect →
                  </a>
                )}
              </div>
            )
          })}
        </div>

        <footer className="p-4 border-t border-border text-[11px] text-text-faint leading-relaxed">
          Access is granted per account via each provider's own consent screen. You can revoke it there at any time.
        </footer>
      </aside>
    </>
  )
}
