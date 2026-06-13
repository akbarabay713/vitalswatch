import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import type { VitalRating } from '@/data/types'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium leading-none',
  {
    variants: {
      tone: {
        good: 'border-good/30 bg-good-soft text-good',
        needs: 'border-needs/30 bg-needs-soft text-needs',
        poor: 'border-poor/30 bg-poor-soft text-poor',
        brand: 'border-brand/30 bg-brand-soft text-brand',
        neutral: 'border-border-strong bg-overlay text-ink-muted',
      },
      size: {
        sm: 'px-2 py-0.5 text-[11px]',
        md: 'px-2.5 py-1 text-xs',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'sm',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

export const ratingToTone: Record<VitalRating, 'good' | 'needs' | 'poor'> = {
  good: 'good',
  'needs-improvement': 'needs',
  poor: 'poor',
}

export const Badge = ({
  className,
  tone,
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) => (
  <span className={cn(badgeVariants({ tone, size }), className)} {...props}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
    {children}
  </span>
)
