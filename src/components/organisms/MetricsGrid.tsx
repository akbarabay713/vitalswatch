import { useMemo } from 'react'
import { MetricCard } from '@/components/molecules/MetricCard'
import { VITAL_ORDER } from '@/data/thresholds'
import type { CommitData } from '@/data/types'

interface MetricsGridProps {
  current: CommitData
  previous?: CommitData
  /** oldest → newest, for the sparklines */
  history?: CommitData[]
}

export const MetricsGrid = ({ current, previous, history }: MetricsGridProps) => {
  const series = useMemo(() => {
    if (!history) return null
    return {
      lcp: history.map((c) => c.vitals.lcp),
      inp: history.map((c) => c.vitals.inp),
      cls: history.map((c) => c.vitals.cls),
    }
  }, [history])

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {VITAL_ORDER.map((vital) => (
        <MetricCard
          key={vital}
          vital={vital}
          value={current.vitals[vital]}
          previous={previous?.vitals[vital]}
          history={series?.[vital]}
        />
      ))}
    </div>
  )
}
