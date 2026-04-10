'use client'
import { useRef, useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { Zap, FileText, Plug } from 'lucide-react'
import { useUser } from '@/hooks/useUser'

interface IconRailProps {
  activeRail: string
  setActiveRail: (rail: string) => void
}

export default function IconRail() {
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
    { id: 'workflows', icon: <Zap size={16} />, label: 'Workflows' },
    { id: 'recipes',   icon: <FileText size={16} />, label: 'Recipes' },
    { id: 'connections', icon: <Plug size={16} />, label: 'Connections' },
  ]

  return (
    <div className="w-[52px] border-r border-[#e0ddd6] flex flex-col items-center py-3 gap-1 bg-[#f3f2ef] relative">
      {rails.map(r => (
        <button
          key={r.id}
          title={r.label}
          onClick={() => setActiveRail(r.id)}
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all
            ${activeRail === r.id
              ? 'bg-white border border-[#e0ddd6] text-[#0a0a0a]'
              : 'text-[#888] hover:bg-[#eae9e4] hover:text-[#0a0a0a]'
            }`}
        >
          {r.icon}
        </button>
      ))}

      {/* Avatar + Dropdown */}
      <div className="mt-auto relative" ref={dropdownRef}>
        {dropdownOpen && (
          <div className="absolute bottom-12 left-0 w-56 bg-white border border-[#e0ddd6] rounded-xl shadow-lg p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <p className="text-[13px] font-medium text-[#0a0a0a] truncate">{name}</p>
            <p className="text-[11px] text-[#888] truncate mb-3">{email}</p>
            <hr className="border-[#e0ddd6] mb-3" />
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left text-[12px] text-[#dc2626] hover:bg-[#fef2f2] px-2 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
        <button
          onClick={() => setDropdownOpen(prev => !prev)}
          className="w-7 h-7 rounded-full bg-[#0a0a0a] text-white text-[10px] font-semibold flex items-center justify-center hover:scale-105 transition-transform"
        >
          {initials}
        </button>
      </div>
    </div>
  )
}
