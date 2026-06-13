import { create } from 'zustand'
import { generateCommits } from '@/data/generateCommits'
import { createMockCommitSource } from '@/data/source'
import { readCache, writeCache } from '@/lib/sourceCache'
import type { CommitData } from '@/data/types'
import type { CommitSource } from '@/data/source'

type LoadStatus = 'ready' | 'loading' | 'revalidating' | 'error'

interface DataState {
  commits: CommitData[]
  source: CommitSource
  status: LoadStatus
  error: string | null
  lastUpdated: number | null
  setSource: (source: CommitSource) => Promise<void>
}

export const useDataStore = create<DataState>((set, get) => ({
  // Sync init so the first render never blocks
  commits: generateCommits(),
  source: createMockCommitSource(),
  status: 'ready',
  error: null,
  lastUpdated: null,
  setSource: async (source) => {
    const cached = source.cacheKey ? readCache(source.cacheKey) : null

    if (cached) {
      // Stale-while-revalidate: show cached data instantly, refresh in background
      set({
        source,
        commits: cached.commits,
        lastUpdated: cached.fetchedAt,
        status: 'revalidating',
        error: null,
      })
    } else {
      set({ source, status: 'loading', error: null })
    }

    try {
      const commits = await source.load()
      // Guard against a slower stale request overwriting a newer source switch
      if (get().source !== source) return
      const fetchedAt = Date.now()
      if (source.cacheKey) writeCache(source.cacheKey, commits, fetchedAt)
      set({
        commits,
        status: 'ready',
        lastUpdated: source.cacheKey ? fetchedAt : null,
      })
    } catch (err) {
      if (get().source !== source) return
      const message = err instanceof Error ? err.message : String(err)
      // If we served cache, keep showing it; otherwise surface the failure
      set({ status: 'error', error: message })
    }
  },
}))
