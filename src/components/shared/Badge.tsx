import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'accent'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-bg-elevated text-text-primary border border-border',
    success: 'bg-accent-green-bg text-accent-green border border-accent-green/25',
    warning: 'bg-accent-amber-bg text-accent-amber border border-accent-amber/25',
    danger: 'bg-accent-red-bg text-accent-red border border-accent-red/25',
    muted: 'bg-bg-surface text-text-secondary border border-border',
    accent: 'bg-accent/15 text-accent border border-accent/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium tracking-tight',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
