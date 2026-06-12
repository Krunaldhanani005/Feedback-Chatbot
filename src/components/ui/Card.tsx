import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glow = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-dark-card border border-dark-border rounded-2xl',
        hover && 'hover:border-brand-red/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer',
        glow && 'shadow-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'

const CardHeader = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pb-0', className)} {...props}>{children}</div>
)

const CardContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props}>{children}</div>
)

const CardFooter = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0', className)} {...props}>{children}</div>
)

export { Card, CardHeader, CardContent, CardFooter }
