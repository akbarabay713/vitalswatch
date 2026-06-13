import { useMemo, useState } from 'react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { TreemapTile } from '@/components/molecules/TreemapTile'
import { totalBundleKb } from '@/data/generateCommits'
import { formatSignedKb } from '@/lib/format'
import type { BundleModule, CommitData } from '@/data/types'

interface BundleTreemapProps {
  commit: CommitData
}

interface Row {
  modules: BundleModule[]
  sum: number
}

const CATEGORY_LABEL: Record<BundleModule['category'], string> = {
  framework: 'Framework',
  app: 'App code',
  vendor: 'Vendor',
  assets: 'Assets',
}

const CATEGORY_DOT: Record<BundleModule['category'], string> = {
  framework: 'bg-brand',
  app: 'bg-good',
  vendor: 'bg-needs',
  assets: 'bg-ink-muted',
}

// sort largest-first and fill rows to a target weight so the layout reads like
// a treemap; row height ∝ weight, clamped so one huge module doesn't crush the rest
const packRows = (modules: BundleModule[], total: number): Row[] => {
  const sorted = [...modules].sort((a, b) => b.sizeKb - a.sizeKb)
  const targetPerRow = total / 3
  const rows: Row[] = []
  let current: Row = { modules: [], sum: 0 }

  for (const m of sorted) {
    current.modules.push(m)
    current.sum += m.sizeKb
    if (current.sum >= targetPerRow && rows.length < 2) {
      rows.push(current)
      current = { modules: [], sum: 0 }
    }
  }
  if (current.modules.length) rows.push(current)
  return rows
}

export const BundleTreemap = ({ commit }: BundleTreemapProps) => {
  const total = totalBundleKb(commit)
  const rows = useMemo(() => packRows(commit.bundle, total), [commit, total])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  // default the drill-down to the heaviest new module
  const selected =
    commit.bundle.find((m) => m.name === selectedName) ??
    (selectedName === null
      ? [...commit.bundle].filter((m) => m.isNew).sort((a, b) => b.sizeKb - a.sizeKb)[0]
      : undefined)

  const toggle = (name: string) =>
    setSelectedName((prev) => (prev === name ? '' : name))

  const newWeight = commit.bundleDelta
    .filter((d) => d.isNew)
    .reduce((s, d) => s + d.sizeKb, 0)

  return (
    <Card padding="lg" className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Bundle analyzer</CardTitle>
          <CardDescription>
            JS + asset weight at this commit ·{' '}
            <span className="font-mono text-ink-muted">
              {(total / 1000).toFixed(2)}mb total
            </span>
          </CardDescription>
        </div>
        {newWeight > 0 && (
          <Badge tone="poor">{formatSignedKb(newWeight)} added</Badge>
        )}
      </CardHeader>

      <ul className="sr-only">
        {[...commit.bundle]
          .sort((a, b) => b.sizeKb - a.sizeKb)
          .map((m) => (
            <li key={m.name}>
              {m.name}: {m.sizeKb}kb{m.isNew ? ', new this commit' : ''}
            </li>
          ))}
      </ul>

      <div
        className="flex h-[280px] flex-col gap-1.5"
        role="group"
        aria-label={`Bundle composition, ${(total / 1000).toFixed(2)} megabytes total. Select a module for details.`}
      >
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex min-h-0 gap-1.5"
            style={{ flexGrow: Math.max(row.sum / total, 0.14), flexBasis: 0 }}
          >
            {row.modules.map((m) => (
              <TreemapTile
                key={m.name}
                module={m}
                share={m.sizeKb / row.sum}
                selected={selected?.name === m.name}
                onSelect={toggle}
              />
            ))}
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-3 rounded-lg border border-border-strong bg-overlay/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <code className="font-mono text-sm text-ink">{selected.name}</code>
            <Badge tone="neutral" size="sm">
              {selected.sizeKb >= 1000
                ? `${(selected.sizeKb / 1000).toFixed(2)}mb`
                : `${selected.sizeKb}kb`}
            </Badge>
          </div>
          {selected.importedBy && selected.importedBy.length > 0 && (
            <div className="mt-2 text-xs text-ink-muted">
              Imported by{' '}
              {selected.importedBy.map((src, i) => (
                <span key={src}>
                  {i > 0 && ', '}
                  <code className="font-mono text-ink-subtle">{src}</code>
                </span>
              ))}
            </div>
          )}
          {selected.note && (
            <p className="mt-1.5 text-xs leading-relaxed text-ink-subtle">
              {selected.note}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-ink-subtle">
        {(Object.keys(CATEGORY_LABEL) as BundleModule['category'][]).map((cat) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-sm ${CATEGORY_DOT[cat]}`} />
            {CATEGORY_LABEL[cat]}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm ring-2 ring-poor" />
          New this commit
        </span>
      </div>
    </Card>
  )
}
