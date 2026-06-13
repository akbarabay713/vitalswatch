import { useMemo, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { RecommendationCard } from '@/components/molecules/RecommendationCard'
import { useRoiStore } from '@/store/useRoiStore'
import { applyRecoveries, getRecommendations } from '@/data/recommendations'
import { commitScenario } from '@/data/impact'
import { projectImpact } from '@/lib/roi'
import { formatCurrency, formatMs } from '@/lib/format'
import type { CommitData } from '@/data/types'

interface RecommendationsPanelProps {
  commit: CommitData
}

export const RecommendationsPanel = ({ commit }: RecommendationsPanelProps) => {
  const recommendations = getRecommendations(commit)
  const assumptions = useRoiStore((s) => s.assumptions)
  const [applied, setApplied] = useState<Set<string>>(new Set())

  const scenario = useMemo(() => commitScenario(commit), [commit])

  const appliedRecs = recommendations.filter((r) => applied.has(r.title))
  const residual = applyRecoveries(scenario, appliedRecs)

  const before = projectImpact(assumptions, scenario)
  const after = projectImpact(assumptions, residual)
  const recovered = Math.max(0, before.monthlyLoss - after.monthlyLoss)

  const toggle = (title: string) =>
    setApplied((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })

  const applyAll = () =>
    setApplied(
      applied.size === recommendations.length
        ? new Set()
        : new Set(recommendations.map((r) => r.title)),
    )

  const showProjection = before.monthlyLoss > 0

  return (
    <Card padding="lg" className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Generated from this commit&apos;s regression cause
          </CardDescription>
        </div>
        <Badge tone={recommendations.length ? 'brand' : 'good'}>
          {recommendations.length} actions
        </Badge>
      </CardHeader>

      {commit.regressionCause && (
        <div className="mb-4 rounded-lg border border-poor/20 bg-poor-soft/40 p-3">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-poor">
            Root cause
          </div>
          <p className="text-xs leading-relaxed text-ink">{commit.regressionCause}</p>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="text-2xl">✓</span>
          <p className="text-sm text-ink-muted">No action needed</p>
          <p className="text-xs text-ink-subtle">
            This commit is within Core Web Vitals thresholds.
          </p>
        </div>
      ) : (
        <>
          {showProjection && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs text-ink-muted">
                Toggle fixes to model the recovery
              </span>
              <Button variant="ghost" size="sm" onClick={applyAll}>
                {applied.size === recommendations.length
                  ? 'Clear all'
                  : 'Apply all'}
              </Button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard
                key={rec.title}
                recommendation={rec}
                index={i}
                applied={showProjection ? applied.has(rec.title) : undefined}
                onToggle={showProjection ? () => toggle(rec.title) : undefined}
              />
            ))}
          </div>

          {showProjection && (
            <div className="mt-4 rounded-xl border border-good/25 bg-good-soft/20 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
                    Projected recovery
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-good">
                      {formatCurrency(recovered)}
                    </span>
                    <span className="text-xs text-ink-muted">/ mo recovered</span>
                  </div>
                </div>
                <div className="text-right text-xs text-ink-muted">
                  <div>
                    Residual impact:{' '}
                    <span className="font-mono text-ink">
                      {residual.addedDelayMs > 0
                        ? `+${formatMs(residual.addedDelayMs)}`
                        : ''}
                      {residual.addedDelayMs > 0 && residual.addedCls > 0
                        ? ' · '
                        : ''}
                      {residual.addedCls > 0
                        ? `+${residual.addedCls.toFixed(3)} CLS`
                        : residual.addedDelayMs > 0
                          ? ''
                          : 'cleared'}
                    </span>
                  </div>
                  <div className="mt-0.5">
                    {formatCurrency(before.monthlyLoss)} →{' '}
                    <span className="text-good">
                      {formatCurrency(after.monthlyLoss)}
                    </span>{' '}
                    / mo
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
