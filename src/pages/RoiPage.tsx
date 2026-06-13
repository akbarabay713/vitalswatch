import { useMemo } from 'react'
import { useDataset } from '@/data/dataset'
import { PageHeader } from '@/components/templates/PageHeader'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { cn } from '@/lib/cn'
import { RoiSimulator } from '@/components/organisms/RoiSimulator'
import { SensitivityChart } from '@/components/organisms/SensitivityChart'
import { RoiReport } from '@/components/organisms/RoiReport'
import { useRoiStore } from '@/store/useRoiStore'
import {
  commitAddedCls,
  commitAddedDelayMs,
  commitScenario,
  impactScenarios,
} from '@/data/impact'
import { formatMs } from '@/lib/format'
import type { CommitData } from '@/data/types'

const ScenarioBadge = ({ commit }: { commit: CommitData }) => {
  const delay = commitAddedDelayMs(commit)
  const cls = commitAddedCls(commit)
  if (delay > 0)
    return (
      <Badge tone="needs" size="sm">
        +{formatMs(delay)} latency
      </Badge>
    )
  return (
    <Badge tone="poor" size="sm">
      +{cls.toFixed(3)} CLS
    </Badge>
  )
}

export const RoiPage = () => {
  const { commits } = useDataset()
  // impactScenarios() reads the data store; recompute when its commits change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scenarios = useMemo(() => impactScenarios(), [commits])
  const scenarioHash = useRoiStore((s) => s.scenarioHash)
  const setScenario = useRoiStore((s) => s.setScenario)

  // Resolve the active scenario; default to the most recent priced regression.
  const active = scenarios.find((c) => c.hash === scenarioHash) ?? scenarios[0]
  const scenario = active
    ? commitScenario(active)
    : { addedDelayMs: 0, addedCls: 0 }
  const label = active
    ? `Commit ${active.hash} — ${active.message}`
    : 'No active regression'

  return (
    <>
      <div className="print:hidden">
      <PageHeader
        eyebrow="Business impact"
        title="ROI calculator"
        description="Translate a Core Web Vitals regression into projected revenue impact. The conversion heuristics are tunable model inputs, not hardcoded facts."
        actions={
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Export PDF
          </Button>
        }
      />

      <div className="mb-6">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-subtle">
          Model a regression
        </div>
        <div className="flex flex-wrap gap-2">
          {scenarios.map((commit) => {
            const isActive = commit.hash === active?.hash
            return (
              <button
                key={commit.hash}
                type="button"
                onClick={() => setScenario(commit.hash)}
                aria-pressed={isActive}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors',
                  isActive
                    ? 'border-brand bg-brand-soft'
                    : 'border-border bg-surface hover:border-border-strong',
                )}
              >
                <code className="font-mono text-xs text-ink-muted">
                  {commit.hash}
                </code>
                <span className="max-w-45 truncate text-xs text-ink">
                  {commit.message}
                </span>
                <ScenarioBadge commit={commit} />
              </button>
            )
          })}
        </div>
      </div>

      <RoiSimulator scenario={scenario} scenarioLabel={label} />

      <SensitivityChart scenario={scenario} />
      </div>

      <RoiReport
        scenario={scenario}
        scenarioLabel={label}
        className="hidden print:block"
      />
    </>
  )
}
