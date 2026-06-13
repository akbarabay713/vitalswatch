import { useEffect, useReducer, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Badge, ratingToTone } from '@/components/atoms/Badge'
import { rateCommit } from '@/data/thresholds'
import { formatRelativeTime } from '@/lib/format'
import { useDataset } from '@/data/dataset'
import { useDataStore } from '@/store/useDataStore'
import { ThemeToggle } from '@/components/molecules/ThemeToggle'
import { SourceSettings } from '@/components/organisms/SourceSettings'

interface NavItem {
  to: string
  label: string
  hint: string
  icon: string
}

const NAV: NavItem[] = [
  { to: '/', label: 'Timeline', hint: 'Performance over time', icon: '◷' },
  { to: '/commits', label: 'Commits', hint: 'Deep-dive analysis', icon: '⎇' },
  { to: '/compare', label: 'Compare', hint: 'Diff two commits', icon: '⇄' },
  { to: '/roi', label: 'Business impact', hint: 'ROI calculator', icon: '$' },
]

interface AppSidebarProps {
  onNavigate?: () => void
}

export const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const { head, alerts } = useDataset()
  const { source, status, lastUpdated } = useDataStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [, tick] = useReducer((n: number) => n + 1, 0)

  // keep the "updated Xm ago" label fresh while the sidebar sits idle
  useEffect(() => {
    if (!lastUpdated) return
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [lastUpdated])

  const health = head ? rateCommit(head.vitals) : 'good'

  return (
    <>
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-border bg-surface/95 backdrop-blur md:bg-surface/60">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-brand">
            <span className="text-lg" aria-hidden>
              ◉
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">VitalsWatch</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-subtle">
              CWV Regression Tracker
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-overlay text-ink'
                    : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-md font-mono text-sm',
                      isActive ? 'text-brand' : 'text-ink-subtle',
                    )}
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[10px] text-ink-subtle">{item.hint}</span>
                  </span>
                  {item.to === '/' && alerts.length > 0 && (
                    <Badge tone="poor" className="ml-auto">
                      {alerts.length}
                    </Badge>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-ink-subtle">
            Production health
          </div>
          {head ? (
            <>
              <Badge tone={ratingToTone[health]} dot size="md">
                {health === 'good'
                  ? 'All vitals nominal'
                  : health === 'needs-improvement'
                    ? 'Degraded'
                    : 'Regression live'}
              </Badge>
              <div className="mt-3 font-mono text-[10px] text-ink-subtle">
                HEAD · {head.hash}
              </div>
            </>
          ) : (
            <Badge tone="good" dot size="md">No data</Badge>
          )}

          <div className="mt-1 flex items-center gap-1.5">
            {(status === 'loading' || status === 'revalidating') && (
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden />
            )}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title="Change data source"
              className="truncate text-[10px] text-ink-subtle underline-offset-2 hover:text-ink hover:underline"
            >
              {source.label}
            </button>
            <button
              type="button"
              aria-label="Open source settings"
              onClick={() => setSettingsOpen(true)}
              className="ml-auto flex h-5 w-5 items-center justify-center rounded text-ink-subtle hover:bg-overlay hover:text-ink"
            >
              <span aria-hidden className="text-xs">⚙</span>
            </button>
          </div>

          {lastUpdated && status !== 'error' && (
            <div className="mt-1 text-[10px] text-ink-subtle">
              {status === 'revalidating'
                ? 'Refreshing…'
                : `Updated ${formatRelativeTime(lastUpdated)}`}
            </div>
          )}

          {status === 'error' && (
            <div className="mt-2 text-[10px] text-poor">Load failed — check settings</div>
          )}

          <ThemeToggle className="mt-4" />
        </div>
      </aside>

      {settingsOpen && (
        <SourceSettings onClose={() => setSettingsOpen(false)} />
      )}
    </>
  )
}
