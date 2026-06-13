import { Card, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Stat } from '@/components/atoms/Stat'
import { SliderControl } from '@/components/molecules/SliderControl'
import { useRoiStore } from '@/store/useRoiStore'
import { ASSUMPTION_BOUNDS, projectImpact, type ImpactScenario } from '@/lib/roi'
import { formatCompact, formatCurrency, formatMs, formatPercent } from '@/lib/format'

interface RoiSimulatorProps {
  scenario: ImpactScenario
  scenarioLabel: string
}

export const RoiSimulator = ({ scenario, scenarioLabel }: RoiSimulatorProps) => {
  const assumptions = useRoiStore((s) => s.assumptions)
  const setAssumption = useRoiStore((s) => s.setAssumption)
  const reset = useRoiStore((s) => s.reset)

  const projection = projectImpact(assumptions, scenario)
  const hasLatency = scenario.addedDelayMs > 0
  const hasCls = scenario.addedCls > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card padding="lg" className="flex flex-col gap-6">
        <CardHeader>
          <div>
            <CardTitle>Financial model</CardTitle>
            <CardDescription>Tune the inputs to your business</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </CardHeader>

        <SliderControl
          label="Monthly unique visitors"
          displayValue={formatCompact(assumptions.monthlyVisitors)}
          value={assumptions.monthlyVisitors}
          {...ASSUMPTION_BOUNDS.monthlyVisitors}
          onValueChange={(v) => setAssumption('monthlyVisitors', v)}
        />
        <SliderControl
          label="Baseline conversion rate"
          displayValue={formatPercent(assumptions.conversionRate)}
          value={assumptions.conversionRate}
          {...ASSUMPTION_BOUNDS.conversionRate}
          onValueChange={(v) => setAssumption('conversionRate', v)}
        />
        <SliderControl
          label="Average order value"
          displayValue={formatCurrency(assumptions.averageOrderValue)}
          value={assumptions.averageOrderValue}
          {...ASSUMPTION_BOUNDS.averageOrderValue}
          onValueChange={(v) => setAssumption('averageOrderValue', v)}
        />

        <div className="flex flex-col gap-4 rounded-lg border border-brand/20 bg-brand-soft/40 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-brand">
            Adjustable assumptions
          </div>
          <SliderControl
            label="Conversion impact per 100ms"
            displayValue={formatPercent(assumptions.impactPer100ms)}
            value={assumptions.impactPer100ms}
            {...ASSUMPTION_BOUNDS.impactPer100ms}
            onValueChange={(v) => setAssumption('impactPer100ms', v)}
            hint="Latency channel. Industry research clusters around ~1% conversion loss per 100ms of added delay — adjust to your own data."
          />
          <SliderControl
            label="Conversion impact per 0.1 CLS"
            displayValue={formatPercent(assumptions.impactPerTenthCls)}
            value={assumptions.impactPerTenthCls}
            {...ASSUMPTION_BOUNDS.impactPerTenthCls}
            onValueChange={(v) => setAssumption('impactPerTenthCls', v)}
            hint="Layout-shift channel. Unexpected movement drives mis-taps and abandonment — priced per 0.1 of added CLS."
          />
        </div>
      </Card>

      <Card padding="lg" tone="raised" className="flex flex-col">
        <CardHeader>
          <div>
            <CardTitle>Projected impact</CardTitle>
            <CardDescription>{scenarioLabel}</CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {hasLatency && (
              <Badge tone="needs">+{formatMs(scenario.addedDelayMs)} latency</Badge>
            )}
            {hasCls && (
              <Badge tone="poor">+{scenario.addedCls.toFixed(3)} CLS</Badge>
            )}
          </div>
        </CardHeader>

        <div className="flex flex-col items-center justify-center gap-1 rounded-xl border border-poor/20 bg-poor-soft/30 py-6">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Estimated monthly loss
          </span>
          <span className="text-5xl font-bold tabular-nums tracking-tight text-poor">
            {formatCurrency(projection.monthlyLoss)}
          </span>
          <span className="text-xs text-ink-muted">
            {formatCurrency(projection.annualLoss)} / year
          </span>
        </div>

        {hasLatency && hasCls && (
          <div className="mt-4 flex gap-2 text-[11px]">
            <div className="flex-1 rounded-md border border-needs/20 bg-needs-soft/40 p-2">
              <span className="text-ink-subtle">Latency channel</span>
              <div className="font-mono font-semibold text-needs">
                {formatPercent(projection.latencyDropFraction * 100, 2)} drop
              </div>
            </div>
            <div className="flex-1 rounded-md border border-poor/20 bg-poor-soft/40 p-2">
              <span className="text-ink-subtle">Layout-shift channel</span>
              <div className="font-mono font-semibold text-poor">
                {formatPercent(projection.clsDropFraction * 100, 2)} drop
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
          <Stat
            size="sm"
            label="Conversion drop"
            value={formatPercent(projection.conversionDropFraction * 100, 2)}
            tone="poor"
          />
          <Stat
            size="sm"
            label="Lost conversions / mo"
            value={Math.round(projection.lostConversions).toLocaleString()}
            tone="poor"
          />
          <Stat
            size="sm"
            label="Baseline revenue / mo"
            value={formatCurrency(projection.baselineRevenue)}
          />
          <Stat
            size="sm"
            label="Projected revenue / mo"
            value={formatCurrency(projection.projectedRevenue)}
            tone="needs"
          />
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-ink-subtle">
          Conversion drop = (added latency ÷ 100ms × impact-per-100ms) + (added
          CLS ÷ 0.1 × impact-per-0.1-CLS), clamped to 100%. Loss = monthly
          visitors × baseline rate × drop × average order value. All figures
          recompute live as you move the sliders.
        </p>
      </Card>
    </div>
  )
}
