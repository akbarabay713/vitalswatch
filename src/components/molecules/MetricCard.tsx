import { Card } from '@/components/atoms/Card'
import { Badge, ratingToTone } from '@/components/atoms/Badge'
import { Delta } from '@/components/atoms/Delta'
import { Sparkline } from '@/components/atoms/Sparkline'
import { cn } from '@/lib/cn'
import { rateVital, VITAL_META } from '@/data/thresholds'
import type { VitalKey } from '@/data/types'

interface MetricCardProps {
  vital: VitalKey
  value: number
  previous?: number
  /** oldest → newest, for the sparkline */
  history?: number[]
}

const SPARK_COLOR: Record<string, string> = {
  good: 'var(--color-good)',
  needs: 'var(--color-needs)',
  poor: 'var(--color-poor)',
}

const RATING_LABEL: Record<string, string> = {
  good: 'Good',
  'needs-improvement': 'Needs work',
  poor: 'Poor',
}

const BORDER_TONE = {
  good: 'good',
  'needs-improvement': 'needs',
  poor: 'poor',
} as const

export const MetricCard = ({ vital, value, previous, history }: MetricCardProps) => {
  const meta = VITAL_META[vital]
  const rating = rateVital(vital, value)
  const tone = ratingToTone[rating]
  const delta = previous != null ? value - previous : 0

  return (
    <Card tone={BORDER_TONE[rating]} className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-mono text-sm font-semibold text-ink">
            {meta.label}
          </div>
          <div className="text-[11px] text-ink-subtle">{meta.full}</div>
        </div>
        <Badge tone={tone} dot>
          {RATING_LABEL[rating]}
        </Badge>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-end gap-2">
          <span
            className={cn(
              'text-3xl font-semibold tabular-nums tracking-tight',
              tone === 'good' && 'text-good',
              tone === 'needs' && 'text-needs',
              tone === 'poor' && 'text-poor',
            )}
          >
            {meta.format(value)}
          </span>
          {previous != null && (
            <Delta
              className="mb-1.5"
              value={delta}
              format={(abs) => meta.format(abs)}
            />
          )}
        </div>
        {history && history.length > 1 && (
          <Sparkline
            data={history}
            width={96}
            height={30}
            color={SPARK_COLOR[tone]}
            className="mb-1 shrink-0"
          />
        )}
      </div>

      <p className="text-xs leading-relaxed text-ink-muted">
        {meta.description}
      </p>
    </Card>
  )
}
