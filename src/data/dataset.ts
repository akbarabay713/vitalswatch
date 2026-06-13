import { useMemo } from 'react'
import { useDataStore } from '@/store/useDataStore'
import { deriveAlerts } from './alerts'
import type { CommitData } from './types'

// Non-reactive snapshot — safe to call outside React (impact.ts, etc.)
export const getCommits = (): CommitData[] => useDataStore.getState().commits

export const getCommitByHash = (hash: string): CommitData | undefined =>
  getCommits().find((c) => c.hash === hash)

export const getCommitIndex = (hash: string): number =>
  getCommits().findIndex((c) => c.hash === hash)

// Static snapshot evaluated at import time — used by tests that pre-date the store
export const COMMITS = useDataStore.getState().commits

// Reactive hook — use in all components for live source-switching
export const useDataset = () => {
  const commits = useDataStore((s) => s.commits)
  const alerts = useMemo(() => deriveAlerts(commits), [commits])
  return {
    commits,
    head: commits[commits.length - 1] as CommitData | undefined,
    prev: commits[commits.length - 2] as CommitData | undefined,
    alerts,
    getCommitByHash: (hash: string) => commits.find((c) => c.hash === hash),
    getCommitIndex: (hash: string) => commits.findIndex((c) => c.hash === hash),
  }
}
