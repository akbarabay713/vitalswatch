import { useRoiStore } from '@/store/useRoiStore'
import { projectImpact, type ImpactScenario } from '@/lib/roi'
import {
  formatCompact,
  formatCurrency,
  formatMs,
  formatPercent,
} from '@/lib/format'
import { cn } from '@/lib/cn'

interface RoiReportProps {
  scenario: ImpactScenario
  scenarioLabel: string
  className?: string
}

// hidden on screen, shown only when printed (see @media print in index.css)
export const RoiReport = ({ scenario, scenarioLabel, className }: RoiReportProps) => {
  const assumptions = useRoiStore((s) => s.assumptions)
  const p = projectImpact(assumptions, scenario)

  const generated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const rows: Array<[string, string]> = [
    ['Monthly unique visitors', formatCompact(assumptions.monthlyVisitors)],
    ['Baseline conversion rate', formatPercent(assumptions.conversionRate)],
    ['Average order value', formatCurrency(assumptions.averageOrderValue)],
    ['Conversion impact / 100ms', formatPercent(assumptions.impactPer100ms)],
    ['Conversion impact / 0.1 CLS', formatPercent(assumptions.impactPerTenthCls)],
  ]

  const drivers = [
    scenario.addedDelayMs > 0 ? `+${formatMs(scenario.addedDelayMs)} latency` : null,
    scenario.addedCls > 0 ? `+${scenario.addedCls.toFixed(3)} CLS` : null,
  ].filter(Boolean)

  return (
    <div className={cn('roi-report text-ink', className)}>
      <header className="flex items-start justify-between border-b border-border-strong pb-4">
        <div>
          <div className="flex items-center gap-2 text-brand">
            <span className="text-lg" aria-hidden>
              ◉
            </span>
            <span className="text-sm font-semibold">VitalsWatch</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Core Web Vitals — Business Impact Report
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{scenarioLabel}</p>
        </div>
        <div className="text-right text-xs text-ink-muted">
          <div>Generated {generated}</div>
          <div className="mt-0.5">Scenario impact: {drivers.join(' · ') || '—'}</div>
        </div>
      </header>

      <section className="mt-6 rounded-lg border border-poor/30 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Estimated revenue at risk
        </div>
        <div className="mt-1 flex items-baseline gap-4">
          <span className="text-4xl font-bold tabular-nums text-poor">
            {formatCurrency(p.monthlyLoss)}
            <span className="ml-1 text-base font-normal text-ink-muted">/ mo</span>
          </span>
          <span className="text-lg tabular-nums text-ink-muted">
            {formatCurrency(p.annualLoss)} / year
          </span>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-6">
        <div>
          <h2 className="mb-2 text-sm font-semibold">Projection</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5 text-ink-muted">Conversion drop</td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {formatPercent(p.conversionDropFraction * 100, 2)}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-ink-muted">Lost conversions / mo</td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {Math.round(p.lostConversions).toLocaleString()}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-ink-muted">Baseline revenue / mo</td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {formatCurrency(p.baselineRevenue)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 text-ink-muted">Projected revenue / mo</td>
                <td className="py-1.5 text-right font-medium tabular-nums">
                  {formatCurrency(p.projectedRevenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold">Model assumptions</h2>
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <td className="py-1.5 text-ink-muted">{label}</td>
                  <td className="py-1.5 text-right font-medium tabular-nums">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-6 border-t border-border pt-3 text-[11px] leading-relaxed text-ink-subtle">
        Methodology — conversion drop = (added latency ÷ 100ms ×
        impact-per-100ms) + (added CLS ÷ 0.1 × impact-per-0.1-CLS), clamped to
        100%. Loss = monthly visitors × baseline conversion rate × drop × average
        order value. The conversion-impact figures are adjustable model inputs,
        not asserted facts; tune them to your own measured data before acting on
        the numbers above.
      </footer>
    </div>
  )
}
