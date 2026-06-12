import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'red' | 'green' | 'yellow' | 'blue' | 'purple'
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-dark-elevated text-text-secondary border-dark-border',
    red: 'bg-brand-red-muted text-brand-red border-brand-red/20',
    green: 'bg-green-900/20 text-green-400 border-green-800/30',
    yellow: 'bg-yellow-900/20 text-yellow-400 border-yellow-800/30',
    blue: 'bg-blue-900/20 text-blue-400 border-blue-800/30',
    purple: 'bg-purple-900/20 text-purple-400 border-purple-800/30',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
