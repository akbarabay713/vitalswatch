import type { CommitData } from '@/data/types'

const PREFIX = 'vitalswatch-cache:'
const VERSION = 1

export interface CachedResult {
  commits: CommitData[]
  fetchedAt: number
  version: number
}

const hasStorage = (): boolean => typeof localStorage !== 'undefined'

export const readCache = (key: string): CachedResult | null => {
  if (!hasStorage()) return null
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedResult
    if (parsed.version !== VERSION || !Array.isArray(parsed.commits)) return null
    return parsed
  } catch {
    return null
  }
}

export const writeCache = (
  key: string,
  commits: CommitData[],
  fetchedAt: number,
): void => {
  if (!hasStorage()) return
  try {
    const payload: CachedResult = { commits, fetchedAt, version: VERSION }
    localStorage.setItem(PREFIX + key, JSON.stringify(payload))
  } catch {
    // quota or serialization failure — caching is best-effort
  }
}

export const clearCache = (key: string): void => {
  if (!hasStorage()) return
  localStorage.removeItem(PREFIX + key)
}
