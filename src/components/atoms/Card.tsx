import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const cardVariants = cva(
  'rounded-[var(--radius-card)] border bg-surface transition-colors',
  {
    variants: {
      tone: {
        default: 'border-border',
        raised: 'border-border bg-surface-raised',
        good: 'border-good/25',
        needs: 'border-needs/25',
        poor: 'border-poor/25',
      },
      interactive: {
        true: 'cursor-pointer hover:border-border-strong hover:bg-surface-raised',
        false: '',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      tone: 'default',
      interactive: false,
      padding: 'md',
    },
  },
)

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = ({
  className,
  tone,
  interactive,
  padding,
  ...props
}: CardProps) => (
  <div
    className={cn(cardVariants({ tone, interactive, padding }), className)}
    {...props}
  />
)

export const CardHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mb-4 flex items-start justify-between gap-3', className)}
    {...props}
  />
)

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-sm font-semibold tracking-tight text-ink', className)}
    {...props}
  />
)

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-xs text-ink-muted', className)} {...props} />
)
