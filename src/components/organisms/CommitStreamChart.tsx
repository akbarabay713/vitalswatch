import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotProps,
} from 'recharts'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { cn } from '@/lib/cn'
import { rateVital, VITAL_META, VITAL_ORDER, VITAL_THRESHOLDS } from '@/data/thresholds'
import type { CommitData, VitalKey } from '@/data/types'

interface CommitStreamChartProps {
  commits: CommitData[]
  onSelectCommit?: (hash: string) => void
}

interface ChartPoint {
  index: number
  hash: string
  message: string
  author: string
  value: number
  isRegression: boolean
}

const LINE_COLOR: Record<VitalKey, string> = {
  lcp: 'var(--color-brand)',
  inp: 'var(--color-needs)',
  cls: 'var(--color-good)',
}

const CommitDot = (props: DotProps & { payload?: ChartPoint }) => {
  const { cx, cy, payload } = props
  if (cx == null || cy == null || !payload) return null
  if (payload.isRegression) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill="var(--color-poor)" opacity={0.25} />
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="var(--color-poor)"
          stroke="var(--color-canvas)"
          strokeWidth={1.5}
        />
      </g>
    )
  }
  return <circle cx={cx} cy={cy} r={2.5} fill="var(--color-ink-subtle)" />
}

const ChartTooltip = ({
  active,
  payload,
  vital,
}: {
  active?: boolean
  payload?: Array<{ payload: ChartPoint }>
  vital: VitalKey
}) => {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const meta = VITAL_META[vital]
  const rating = rateVital(vital, point.value)
  return (
    <div className="rounded-lg border border-border-strong bg-overlay px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2">
        <code className="font-mono text-xs text-ink-muted">{point.hash}</code>
        {point.isRegression && <Badge tone="poor">Regression</Badge>}
      </div>
      <p className="mt-1 max-w-[220px] truncate text-xs text-ink">
        {point.message}
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        <span
          className={cn(
            'text-lg font-semibold tabular-nums',
            rating === 'good' && 'text-good',
            rating === 'needs-improvement' && 'text-needs',
            rating === 'poor' && 'text-poor',
          )}
        >
          {meta.format(point.value)}
        </span>
        <span className="text-[11px] text-ink-subtle">{meta.label}</span>
      </div>
      <p className="mt-1 text-[10px] text-ink-subtle">Click to open deep-dive →</p>
    </div>
  )
}

export const CommitStreamChart = ({ commits, onSelectCommit }: CommitStreamChartProps) => {
  const [vital, setVital] = useState<VitalKey>('lcp')
  const meta = VITAL_META[vital]
  const { good, needs } = VITAL_THRESHOLDS[vital]

  const data = useMemo<ChartPoint[]>(
    () =>
      commits.map((c, index) => ({
        index,
        hash: c.hash,
        message: c.message,
        author: c.author,
        value: c.vitals[vital],
        isRegression: c.isRegression,
      })),
    [commits, vital],
  )

  const maxValue = Math.max(...data.map((d) => d.value), needs * 1.1)

  return (
    <Card padding="lg" className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Commit stream</CardTitle>
          <CardDescription>
            {meta.full} across the last {commits.length} deployments
          </CardDescription>
        </div>
        <div
          className="flex gap-1 rounded-lg border border-border bg-canvas p-1"
          role="group"
          aria-label="Select which Core Web Vital to plot"
        >
          {VITAL_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setVital(key)}
              aria-pressed={vital === key}
              aria-label={VITAL_META[key].full}
              className={cn(
                'rounded-md px-3 py-1 font-mono text-xs font-medium transition-colors',
                vital === key
                  ? 'bg-overlay text-ink'
                  : 'text-ink-subtle hover:text-ink-muted',
              )}
            >
              {VITAL_META[key].label}
            </button>
          ))}
        </div>
      </CardHeader>

      <ul className="sr-only">
        {data.map((d) => (
          <li key={d.hash}>
            {d.hash}: {meta.label} {meta.format(d.value)}
            {d.isRegression ? ' (regression)' : ''}
          </li>
        ))}
      </ul>

      <div
        className="h-[300px] w-full"
        role="img"
        aria-label={`Line chart of ${meta.full} across ${commits.length} commits`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 4, left: -8 }}
            onClick={(state) => {
              const raw = state?.activeTooltipIndex
              const idx = typeof raw === 'number' ? raw : Number(raw)
              const point = Number.isInteger(idx) ? data[idx] : undefined
              if (point) onSelectCommit?.(point.hash)
            }}
          >
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="hash"
              tick={{ fill: 'var(--color-ink-subtle)', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              interval={2}
            />
            <YAxis
              domain={[0, Math.ceil(maxValue * 10) / 10]}
              tick={{ fill: 'var(--color-ink-subtle)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v) => meta.format(v)}
            />
            <ReferenceLine
              y={good}
              stroke="var(--color-good)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
              label={{ value: 'good', fill: 'var(--color-good)', fontSize: 9, position: 'insideTopRight' }}
            />
            <ReferenceLine
              y={needs}
              stroke="var(--color-poor)"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: 'poor', fill: 'var(--color-poor)', fontSize: 9, position: 'insideTopRight' }}
            />
            <Tooltip
              content={<ChartTooltip vital={vital} />}
              cursor={{ stroke: 'var(--color-border-strong)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={LINE_COLOR[vital]}
              strokeWidth={2}
              dot={<CommitDot />}
              activeDot={{ r: 6, fill: LINE_COLOR[vital] }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-ink-subtle">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-poor" /> Regression commit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-good" /> Good ≤ {meta.format(good)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 border-t border-dashed border-poor" /> Poor ≥ {meta.format(needs)}
        </span>
      </div>
    </Card>
  )
}
