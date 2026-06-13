import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const valueVariants = cva('font-semibold tabular-nums tracking-tight', {
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-4xl',
    },
    tone: {
      default: 'text-ink',
      good: 'text-good',
      needs: 'text-needs',
      poor: 'text-poor',
      brand: 'text-brand',
    },
  },
  defaultVariants: { size: 'md', tone: 'default' },
})

export interface StatProps extends VariantProps<typeof valueVariants> {
  label: ReactNode
  value: ReactNode
  unit?: string
  sub?: ReactNode
  className?: string
}

export const Stat = ({ label, value, unit, sub, size, tone, className }: StatProps) => (
  <div className={cn('flex flex-col gap-1', className)}>
    <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
      {label}
    </span>
    <span className={valueVariants({ size, tone })}>
      {value}
      {unit && (
        <span className="ml-0.5 text-sm font-normal text-ink-muted">{unit}</span>
      )}
    </span>
    {sub && <span className="text-xs text-ink-muted">{sub}</span>}
  </div>
)
