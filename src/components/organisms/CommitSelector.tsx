import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { rateCommit } from '@/data/thresholds'
import type { CommitData } from '@/data/types'

interface CommitSelectorProps {
  commits: CommitData[]
  selectedHash: string
  onSelect: (hash: string) => void
  searchable?: boolean
}

const DOT_TONE = {
  good: 'bg-good',
  'needs-improvement': 'bg-needs',
  poor: 'bg-poor',
} as const

export const CommitSelector = ({
  commits,
  selectedHash,
  onSelect,
  searchable = false,
}: CommitSelectorProps) => {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commits
    return commits.filter(
      (c) =>
        c.hash.includes(q) ||
        c.message.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q),
    )
  }, [commits, query])

  return (
    <div className="flex flex-col gap-2">
      {searchable && (
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by hash, message, or author…"
            aria-label="Filter commits"
            className="w-full max-w-xs rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-ink-subtle focus:border-brand focus:outline-none"
          />
          {query && (
            <span className="text-[11px] text-ink-subtle">
              {filtered.length} of {commits.length}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-2">
        {filtered.length === 0 ? (
          <p className="py-1.5 text-xs text-ink-subtle">No commits match.</p>
        ) : (
          filtered.map((commit) => {
            const rating = rateCommit(commit.vitals)
            const isSelected = commit.hash === selectedHash
            return (
              <button
                key={commit.hash}
                type="button"
                onClick={() => onSelect(commit.hash)}
                aria-pressed={isSelected}
                aria-label={`${commit.hash}: ${commit.message}`}
                title={`${commit.hash} — ${commit.message}`}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-mono text-xs transition-colors',
                  isSelected
                    ? 'border-brand bg-brand-soft text-ink'
                    : 'border-border bg-surface text-ink-subtle hover:border-border-strong hover:text-ink-muted',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', DOT_TONE[rating])} />
                {commit.hash}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
