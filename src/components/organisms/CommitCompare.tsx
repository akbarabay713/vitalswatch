import { Card, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Badge, ratingToTone } from '@/components/atoms/Badge'
import { Hash } from '@/components/atoms/Hash'
import { Delta } from '@/components/atoms/Delta'
import { cn } from '@/lib/cn'
import { compareCommits, type ModuleStatus } from '@/data/compare'
import { VITAL_META } from '@/data/thresholds'
import { formatSignedKb } from '@/lib/format'
import type { CommitData } from '@/data/types'

interface CommitCompareProps {
  a: CommitData
  b: CommitData
}

const STATUS_TONE: Record<ModuleStatus, 'good' | 'poor' | 'neutral'> = {
  added: 'poor',
  removed: 'good',
  changed: 'neutral',
}

export const CommitCompare = ({ a, b }: CommitCompareProps) => {
  const cmp = compareCommits(a, b)

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Vitals comparison */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>

        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
          <div />
          <div className="text-center text-[11px] uppercase tracking-wide text-ink-subtle">
            <Hash value={a.hash} />
          </div>
          <div />
          <div className="text-center text-[11px] uppercase tracking-wide text-ink-subtle">
            <Hash value={b.hash} />
          </div>
          <div className="text-right text-[11px] uppercase tracking-wide text-ink-subtle">
            Δ
          </div>

          {cmp.vitals.map((v) => {
            const meta = VITAL_META[v.vital]
            return (
              <div key={v.vital} className="contents">
                <div className="py-2 font-mono text-xs text-ink-muted">
                  {meta.label}
                </div>
                <div className="py-2 text-center">
                  <Badge tone={ratingToTone[v.ratingA]} size="sm">
                    {meta.format(v.a)}
                  </Badge>
                </div>
                <div className="py-2 text-center text-ink-subtle">→</div>
                <div className="py-2 text-center">
                  <Badge tone={ratingToTone[v.ratingB]} size="sm">
                    {meta.format(v.b)}
                  </Badge>
                </div>
                <div className="py-2 text-right">
                  <Delta value={v.delta} format={(abs) => meta.format(abs)} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-ink-muted">
          <span>Files changed</span>
          <span className="font-mono">
            {cmp.filesA} → {cmp.filesB}
          </span>
        </div>
      </Card>

      {/* Bundle comparison */}
      <Card padding="lg" className="flex flex-col">
        <CardHeader>
          <CardTitle>Bundle</CardTitle>
          <Badge tone={cmp.bundleDeltaKb > 0 ? 'poor' : cmp.bundleDeltaKb < 0 ? 'good' : 'neutral'}>
            {formatSignedKb(cmp.bundleDeltaKb)}
          </Badge>
        </CardHeader>

        <div className="mb-3 flex items-baseline gap-2 font-mono text-sm text-ink-muted">
          <span>{(cmp.bundleTotalA / 1000).toFixed(2)}mb</span>
          <span className="text-ink-subtle">→</span>
          <span className="text-ink">{(cmp.bundleTotalB / 1000).toFixed(2)}mb</span>
        </div>

        {cmp.modules.length === 0 ? (
          <p className="py-6 text-center text-xs text-ink-subtle">
            No bundle changes between these commits.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {cmp.modules.slice(0, 8).map((m) => (
              <li key={m.name} className="flex items-center gap-2 py-2">
                <Badge tone={STATUS_TONE[m.status]} size="sm" className="w-16 justify-center">
                  {m.status}
                </Badge>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-muted">
                  {m.name}
                </span>
                <span
                  className={cn(
                    'font-mono text-xs tabular-nums',
                    m.deltaKb > 0 ? 'text-poor' : 'text-good',
                  )}
                >
                  {formatSignedKb(m.deltaKb)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
