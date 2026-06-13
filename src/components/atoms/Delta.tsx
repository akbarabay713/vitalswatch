import { cn } from '@/lib/cn'

interface DeltaProps {
  value: number
  format?: (abs: number) => string
  /** when true (default) a positive delta is bad (red) — higher vitals/bundle are worse */
  higherIsWorse?: boolean
  className?: string
}

export const Delta = ({
  value,
  format = (n) => n.toFixed(2),
  higherIsWorse = true,
  className,
}: DeltaProps) => {
  if (value === 0) {
    return (
      <span className={cn('font-mono text-xs text-ink-subtle', className)}>
        ±0
      </span>
    )
  }
  const isUp = value > 0
  const isBad = higherIsWorse ? isUp : !isUp
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-mono text-xs tabular-nums',
        isBad ? 'text-poor' : 'text-good',
        className,
      )}
    >
      <span aria-hidden>{isUp ? '▲' : '▼'}</span>
      {format(Math.abs(value))}
    </span>
  )
}
