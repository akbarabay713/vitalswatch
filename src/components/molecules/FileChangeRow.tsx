import { useState } from 'react'
import { cn } from '@/lib/cn'
import type { FileChange } from '@/data/types'

interface FileChangeRowProps {
  file: FileChange
}

const DiffHunk = ({ hunk }: { hunk: string }) => (
  <pre className="mt-1 overflow-x-auto rounded-md border border-border bg-canvas p-3 font-mono text-[11px] leading-relaxed">
    {hunk.split('\n').map((line, i) => {
      const added = line.startsWith('+')
      const removed = line.startsWith('-')
      return (
        <div
          key={i}
          className={cn(
            'whitespace-pre',
            added && 'bg-good-soft/40 text-good',
            removed && 'bg-poor-soft/40 text-poor',
            !added && !removed && 'text-ink-subtle',
          )}
        >
          {line || ' '}
        </div>
      )
    })}
  </pre>
)

export const FileChangeRow = ({ file }: FileChangeRowProps) => {
  const [open, setOpen] = useState(false)
  const total = file.additions + file.deletions
  const squares = 5
  const addSquares = total === 0 ? 0 : Math.round((file.additions / total) * squares)
  const expandable = Boolean(file.hunk)

  const stat = (
    <>
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-muted">
        {expandable && (
          <span className="mr-1 inline-block text-ink-subtle">
            {open ? '▾' : '▸'}
          </span>
        )}
        {file.path}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-good">
        +{file.additions}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-poor">
        −{file.deletions}
      </span>
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: squares }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-2 w-2 rounded-[2px]',
              i < addSquares ? 'bg-good' : 'bg-poor',
              total === 0 && 'bg-border-strong',
            )}
          />
        ))}
      </span>
    </>
  )

  if (!expandable) {
    return <div className="flex items-center gap-3 py-2">{stat}</div>
  }

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        {stat}
      </button>
      {open && file.hunk && <DiffHunk hunk={file.hunk} />}
    </div>
  )
}
