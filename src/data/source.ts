import { generateCommits } from './generateCommits'
import type { CommitData } from './types'

export interface CommitSource {
  readonly id: string
  readonly label: string
  load(): Promise<CommitData[]>
}

export const createMockCommitSource = (seed?: number): CommitSource => ({
  id: 'mock',
  label: 'Simulated CI pipeline',
  load: () => Promise.resolve(generateCommits(seed)),
})

// Stable singleton used in tests and as the store default
export const commitSource: CommitSource = createMockCommitSource()
