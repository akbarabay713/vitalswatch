import { Link } from 'react-router-dom'
import { Card } from '@/components/atoms/Card'
import { buttonVariants } from '@/components/atoms/Button'
import { useRoiStore } from '@/store/useRoiStore'
import { projectImpact, type ImpactScenario } from '@/lib/roi'
import { formatCurrency, formatMs } from '@/lib/format'

interface ImpactCalloutProps {
  scenario: ImpactScenario
}

// reads the shared ROI assumptions so tuning the model flows through here too
export const ImpactCallout = ({ scenario }: ImpactCalloutProps) => {
  const assumptions = useRoiStore((s) => s.assumptions)
  const projection = projectImpact(assumptions, scenario)

  if (projection.monthlyLoss <= 0) return null

  const drivers = [
    scenario.addedDelayMs > 0 ? `+${formatMs(scenario.addedDelayMs)} latency` : null,
    scenario.addedCls > 0 ? `+${scenario.addedCls.toFixed(3)} CLS` : null,
  ].filter(Boolean)

  return (
    <Card tone="poor" padding="lg" className="flex flex-wrap items-center gap-4">
      <div className="flex-1">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
          Projected business impact
        </div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tabular-nums text-poor">
            {formatCurrency(projection.monthlyLoss)}
          </span>
          <span className="text-sm text-ink-muted">/ month in lost conversions</span>
        </div>
        <p className="mt-1 text-xs text-ink-subtle">
          Based on {drivers.join(' and ')} and your current ROI model assumptions.
        </p>
      </div>
      <Link to="/roi" className={buttonVariants({ variant: 'secondary' })}>
        Open ROI calculator →
      </Link>
    </Card>
  )
}
