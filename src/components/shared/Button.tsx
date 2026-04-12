import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-card font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:opacity-50 disabled:pointer-events-none'

  const variants = {
    primary:
      'bg-accent text-white hover:scale-[1.02] hover:brightness-110 border border-transparent',
    secondary:
      'bg-bg-elevated text-text-primary border border-border hover:border-border-emphasis hover:bg-bg-surface',
    outline:
      'bg-transparent text-text-primary border border-border hover:bg-bg-elevated hover:border-border-emphasis',
    ghost:
      'bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-elevated',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  }

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
