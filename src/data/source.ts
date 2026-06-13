import { generateCommits } from './generateCommits'
import type { CommitData } from './types'

// Swap the implementation here to read from Lighthouse CI / CrUX instead of
// the mock engine — nothing downstream of this interface changes.
export interface CommitSource {
  readonly id: string
  readonly label: string
  load(): CommitData[]
}

export const createMockCommitSource = (seed?: number): CommitSource => ({
  id: 'mock',
  label: 'Simulated CI pipeline',
  load: () => generateCommits(seed),
})

export const commitSource: CommitSource = createMockCommitSource()
