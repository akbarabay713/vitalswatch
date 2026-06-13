import { Badge, ratingToTone } from '@/components/atoms/Badge'
import { Hash } from '@/components/atoms/Hash'
import { rateCommit, rateVital, VITAL_META, VITAL_ORDER } from '@/data/thresholds'
import { formatShortDate } from '@/lib/format'
import type { CommitData } from '@/data/types'

interface CommitHeaderProps {
  commit: CommitData
}

const RATING_LABEL: Record<string, string> = {
  good: 'Healthy',
  'needs-improvement': 'Needs work',
  poor: 'Regression',
}

export const CommitHeader = ({ commit }: CommitHeaderProps) => {
  const overall = rateCommit(commit.vitals)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Hash value={commit.hash} className="text-sm" />
        <Badge tone={ratingToTone[overall]} dot>
          {RATING_LABEL[overall]}
        </Badge>
        <span className="text-xs text-ink-subtle">
          {commit.author} · {formatShortDate(commit.date)}
        </span>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        {commit.message}
      </h1>

      <div className="flex flex-wrap gap-2">
        {VITAL_ORDER.map((key) => {
          const meta = VITAL_META[key]
          const rating = rateVital(key, commit.vitals[key])
          return (
            <div
              key={key}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5"
            >
              <span className="font-mono text-xs text-ink-subtle">{meta.label}</span>
              <span
                className="font-mono text-sm font-semibold tabular-nums"
                data-rating={rating}
              >
                <Badge tone={ratingToTone[rating]} size="sm">
                  {meta.format(commit.vitals[key])}
                </Badge>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
