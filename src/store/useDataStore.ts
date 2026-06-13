import { create } from 'zustand'
import { generateCommits } from '@/data/generateCommits'
import { createMockCommitSource } from '@/data/source'
import type { CommitData } from '@/data/types'
import type { CommitSource } from '@/data/source'

type LoadStatus = 'ready' | 'loading' | 'error'

interface DataState {
  commits: CommitData[]
  source: CommitSource
  status: LoadStatus
  error: string | null
  setSource: (source: CommitSource) => Promise<void>
}

export const useDataStore = create<DataState>((set) => ({
  // Sync init so the first render never blocks
  commits: generateCommits(),
  source: createMockCommitSource(),
  status: 'ready',
  error: null,
  setSource: async (source) => {
    set({ status: 'loading', error: null, source })
    try {
      const commits = await source.load()
      set({ commits, status: 'ready' })
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      })
    }
  },
}))
