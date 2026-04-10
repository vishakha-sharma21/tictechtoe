import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-surface text-text-primary border border-border',
    success: 'bg-accent-green-bg text-accent-green border border-accent-green',
    warning: 'bg-accent-amber-bg text-accent-amber border border-accent-amber',
    danger: 'bg-accent-red-bg text-accent-red border border-accent-red',
    muted: 'bg-muted-surface text-text-muted border border-border',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-small text-xs font-mono font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
