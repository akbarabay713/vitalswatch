import { Badge } from '@/components/atoms/Badge'
import { cn } from '@/lib/cn'
import { VITAL_META } from '@/data/thresholds'
import type { Recommendation } from '@/data/recommendations'

interface RecommendationCardProps {
  recommendation: Recommendation
  index: number
  applied?: boolean
  onToggle?: () => void
}

// toggle covers the body only so the provenance link isn't nested in a button
export const RecommendationCard = ({
  recommendation,
  index,
  applied,
  onToggle,
}: RecommendationCardProps) => {
  const meta = VITAL_META[recommendation.vital]
  const interactive = Boolean(onToggle)

  const body = (
    <>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold',
          applied ? 'bg-good-soft text-good' : 'bg-brand-soft text-brand',
        )}
      >
        {applied ? '✓' : index + 1}
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-ink">{recommendation.title}</h4>
          <Badge tone="good" className="shrink-0">
            {recommendation.estimatedGain}
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          {recommendation.detail}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Badge tone="neutral" size="sm">
            Targets {meta.label}
          </Badge>
          {interactive && (
            <span className="text-[11px] text-ink-subtle">
              {applied ? 'Applied in projection' : 'Click to apply'}
            </span>
          )}
        </div>
      </div>
    </>
  )

  const provenance = (
    <a
      href={recommendation.source.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="mt-2 ml-10 inline-flex w-fit items-center gap-1 text-[11px] text-brand hover:underline"
    >
      {recommendation.source.label} ↗
    </a>
  )

  return (
    <div
      className={cn(
        'flex flex-col rounded-[var(--radius-card)] border bg-surface-raised p-4 transition-colors',
        interactive && applied && 'border-good/40 bg-good-soft/20',
        interactive && !applied && 'border-border',
        !interactive && 'border-border',
      )}
    >
      {interactive ? (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={applied}
          className="flex gap-3 text-left"
        >
          {body}
        </button>
      ) : (
        <div className="flex gap-3">{body}</div>
      )}
      {provenance}
    </div>
  )
}
