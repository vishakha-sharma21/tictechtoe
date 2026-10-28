'use client'
import { useRef, useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Zap, Plug, KeyRound } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface IconRailProps {
  onOpenIntegrations?: () => void
  onOpenLlmKeys?: () => void
}

export default function IconRail({ onOpenIntegrations, onOpenLlmKeys }: IconRailProps) {
  const [activeRail, setActiveRail] = useState('workflows')
  const { name, email, initials } = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const rails = [
    {
      id: 'workflows',
      icon: Zap,
      label: 'Workflows',
      onClick: () => setActiveRail('workflows'),
    },
    {
      id: 'integrations',
      icon: Plug,
      label: 'Integrations',
      onClick: () => {
        setActiveRail('integrations')
        onOpenIntegrations?.()
      },
    },
    {
      id: 'ai-keys',
      icon: KeyRound,
      label: 'AI provider key',
      onClick: () => onOpenLlmKeys?.(),
    },
  ]

  return (
    <div className="w-[52px] border-r border-border flex flex-col items-center py-3 gap-1 bg-bg-surface relative shrink-0">
      {rails.map((r) => {
        const Icon = r.icon
        const active = activeRail === r.id
        return (
          <button
            key={r.id}
            type="button"
            title={r.label}
            aria-label={r.label}
            onClick={r.onClick}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 relative group
            ${
              active
                ? 'text-accent bg-bg-elevated border border-border-emphasis'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border border-transparent'
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent" />
            )}
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
            <span className="sr-only">{r.label}</span>
          </button>
        )
      })}

      <div className="mt-auto relative" ref={dropdownRef}>
        {dropdownOpen && (
          <div className="absolute bottom-12 left-0 w-56 bg-bg-elevated border border-border rounded-xl shadow-xl p-3 z-50">
            <p className="text-[13px] font-medium text-text-primary truncate">{name}</p>
            <p className="text-[11px] text-text-secondary truncate mb-3">{email}</p>
            <hr className="border-border mb-3" />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left text-[12px] text-accent-red hover:bg-accent-red/10 px-2 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
        <button
          type="button"
          title="Account"
          aria-label="Account menu"
          onClick={() => setDropdownOpen((p) => !p)}
          className="w-8 h-8 rounded-full bg-accent text-white text-[10px] font-semibold flex items-center justify-center hover:scale-[1.02] transition-transform duration-200 border border-border-emphasis"
        >
          {initials}
        </button>
      </div>
    </div>
  )
}
