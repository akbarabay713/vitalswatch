import { getCommits, getCommitIndex } from './dataset'
import type { ImpactScenario } from '@/lib/roi'
import type { CommitData, RegressionType } from './types'

// Price each regression only off the vital its cause actually moved, otherwise
// we'd just be measuring baseline jitter.
const LATENCY_VITAL: Record<RegressionType, 'lcp' | 'inp' | null> = {
  'uncompressed-image': 'lcp',
  'render-blocking': 'lcp',
  'unoptimized-dependency': 'inp',
  'main-thread-block': 'inp',
  'layout-shift': null,
}

export const commitAddedDelayMs = (commit: CommitData): number => {
  const commits = getCommits()
  const idx = getCommitIndex(commit.hash)
  if (idx <= 0 || !commit.regressionType) return 0
  const vital = LATENCY_VITAL[commit.regressionType]
  if (!vital) return 0
  const prev = commits[idx - 1]
  const deltaMs =
    vital === 'lcp'
      ? (commit.vitals.lcp - prev.vitals.lcp) * 1000
      : commit.vitals.inp - prev.vitals.inp
  return Math.round(Math.max(0, deltaMs))
}

export const commitAddedCls = (commit: CommitData): number => {
  const commits = getCommits()
  const idx = getCommitIndex(commit.hash)
  if (idx <= 0 || commit.regressionType !== 'layout-shift') return 0
  const prev = commits[idx - 1]
  return Math.max(0, Number((commit.vitals.cls - prev.vitals.cls).toFixed(3)))
}

export const commitScenario = (commit: CommitData): ImpactScenario => ({
  addedDelayMs: commitAddedDelayMs(commit),
  addedCls: commitAddedCls(commit),
})

export const hasImpact = (commit: CommitData): boolean => {
  const s = commitScenario(commit)
  return s.addedDelayMs > 0 || s.addedCls > 0
}

export const regressionScenarios = (): CommitData[] =>
  getCommits().filter((c) => c.isRegression).reverse()

export const impactScenarios = (): CommitData[] =>
  regressionScenarios().filter(hasImpact)
