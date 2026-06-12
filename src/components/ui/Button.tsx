'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed touch-target'

    const variants = {
      primary: 'bg-brand-red hover:bg-brand-red-light text-white shadow-brand-sm hover:shadow-brand active:scale-[0.98]',
      secondary: 'bg-dark-elevated hover:bg-dark-border text-white border border-dark-border hover:border-brand-red/50',
      ghost: 'text-text-secondary hover:text-white hover:bg-dark-elevated',
      outline: 'border border-brand-red text-brand-red hover:bg-brand-red hover:text-white',
      danger: 'bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-4 py-2.5',
      lg: 'text-base px-6 py-3',
      xl: 'text-lg px-8 py-4',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
