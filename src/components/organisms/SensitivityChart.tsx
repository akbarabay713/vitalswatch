import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { useRoiStore } from '@/store/useRoiStore'
import {
  ASSUMPTION_BOUNDS,
  projectImpact,
  type ImpactScenario,
  type RoiAssumptions,
} from '@/lib/roi'
import { formatCompact, formatCurrency, formatPercent } from '@/lib/format'

interface SensitivityChartProps {
  scenario: ImpactScenario
}

const drivingAssumption = (
  scenario: ImpactScenario,
): keyof typeof ASSUMPTION_BOUNDS =>
  scenario.addedCls > 0 && scenario.addedDelayMs === 0
    ? 'impactPerTenthCls'
    : 'impactPer100ms'

const ASSUMPTION_LABEL: Record<string, string> = {
  impactPer100ms: 'Conversion impact per 100ms',
  impactPerTenthCls: 'Conversion impact per 0.1 CLS',
}

interface Point {
  x: number
  loss: number
}

export const SensitivityChart = ({ scenario }: SensitivityChartProps) => {
  const assumptions = useRoiStore((s) => s.assumptions)
  const key = drivingAssumption(scenario)
  const bounds = ASSUMPTION_BOUNDS[key]
  const current = assumptions[key]

  const data = useMemo<Point[]>(() => {
    const steps = 40
    const out: Point[] = []
    for (let i = 0; i <= steps; i++) {
      const x = bounds.min + ((bounds.max - bounds.min) * i) / steps
      const probe: RoiAssumptions = { ...assumptions, [key]: x }
      out.push({ x, loss: projectImpact(probe, scenario).monthlyLoss })
    }
    return out
  }, [assumptions, key, bounds.min, bounds.max, scenario])

  return (
    <Card padding="lg" className="mt-6 flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Sensitivity</CardTitle>
          <CardDescription>
            Monthly loss across the full range of “{ASSUMPTION_LABEL[key]}”, with
            your current value marked
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 4 }}>
            <defs>
              <linearGradient id="sensitivity-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="x"
              type="number"
              domain={[bounds.min, bounds.max]}
              tick={{ fill: 'var(--color-ink-subtle)', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickFormatter={(v: number) => formatPercent(v, 1)}
            />
            <YAxis
              tick={{ fill: 'var(--color-ink-subtle)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v: number) => `$${formatCompact(v)}`}
            />
            <Tooltip
              cursor={{ stroke: 'var(--color-border-strong)' }}
              contentStyle={{
                background: 'var(--color-overlay)',
                border: '1px solid var(--color-border-strong)',
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: 'var(--color-ink-muted)' }}
              formatter={(value) => [formatCurrency(Number(value)), 'Monthly loss']}
              labelFormatter={(v) => `${formatPercent(Number(v), 1)} assumption`}
            />
            <ReferenceLine
              x={current}
              stroke="var(--color-needs)"
              strokeDasharray="4 4"
              label={{
                value: 'current',
                fill: 'var(--color-needs)',
                fontSize: 10,
                position: 'top',
              }}
            />
            <Area
              type="monotone"
              dataKey="loss"
              stroke="var(--color-brand)"
              strokeWidth={2}
              fill="url(#sensitivity-fill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
