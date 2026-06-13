import type { CommitData, VitalKey } from './types'
import { VITAL_META } from './thresholds'

export interface RegressionAlert {
  commitHash: string
  vital: VitalKey
  from: number
  to: number
  headline: string
  cause?: string
  date: string
}

export const deriveAlerts = (commits: CommitData[]): RegressionAlert[] => {
  const alerts: RegressionAlert[] = []

  for (let i = 1; i < commits.length; i++) {
    const commit = commits[i]
    if (!commit.isRegression) continue
    const prev = commits[i - 1]

    const keys: VitalKey[] = ['lcp', 'inp', 'cls']
    let worst: VitalKey = 'lcp'
    let worstRatio = 0
    for (const k of keys) {
      const ratio = (commit.vitals[k] - prev.vitals[k]) / (prev.vitals[k] || 1)
      if (ratio > worstRatio) {
        worstRatio = ratio
        worst = k
      }
    }

    const from = prev.vitals[worst]
    const to = commit.vitals[worst]
    const meta = VITAL_META[worst]
    const delta = meta.format(Math.abs(to - from))

    alerts.push({
      commitHash: commit.hash,
      vital: worst,
      from,
      to,
      headline: `Commit ${commit.hash} dropped ${meta.label} by ${delta}`,
      cause: commit.regressionCause,
      date: commit.date,
    })
  }

  return alerts.reverse()
}
