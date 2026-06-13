import { Badge } from '@/components/atoms/Badge'
import { Hash } from '@/components/atoms/Hash'
import { VITAL_META } from '@/data/thresholds'
import { formatShortDate } from '@/lib/format'
import type { RegressionAlert } from '@/data/alerts'

interface AlertItemProps {
  alert: RegressionAlert
  onSelect?: (hash: string) => void
}

export const AlertItem = ({ alert, onSelect }: AlertItemProps) => {
  const meta = VITAL_META[alert.vital]
  return (
    <button
      type="button"
      onClick={() => onSelect?.(alert.commitHash)}
      className="group flex w-full items-start gap-3 rounded-lg border border-poor/20 bg-poor-soft/40 p-3 text-left transition-colors hover:border-poor/40 hover:bg-poor-soft"
    >
      <span
        className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-poor"
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">
            {meta.label} regression
          </span>
          <Hash value={alert.commitHash} />
          <span className="ml-auto text-[11px] text-ink-subtle">
            {formatShortDate(alert.date)}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-muted">
          {meta.format(alert.from)} → {' '}
          <span className="font-medium text-poor">{meta.format(alert.to)}</span>
        </p>
        {alert.cause && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-subtle">
            {alert.cause}
          </p>
        )}
      </div>
      <Badge
        tone="poor"
        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        Inspect →
      </Badge>
    </button>
  )
}
