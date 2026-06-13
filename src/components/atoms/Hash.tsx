import { cn } from '@/lib/cn'

interface HashProps {
  value: string
  className?: string
}

export const Hash = ({ value, className }: HashProps) => (
  <code
    className={cn(
      'rounded bg-overlay px-1.5 py-0.5 font-mono text-xs text-ink-muted',
      className,
    )}
  >
    {value}
  </code>
)
