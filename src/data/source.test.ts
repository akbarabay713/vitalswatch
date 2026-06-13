import { describe, expect, it } from 'vitest'
import { commitSource, createMockCommitSource } from './source'

describe('CommitSource', () => {
  it('the default source is the deterministic mock', () => {
    expect(commitSource.id).toBe('mock')
    expect(commitSource.label).toBeTruthy()
  })

  it('loads a full, stable commit history', () => {
    const a = commitSource.load()
    const b = commitSource.load()
    expect(a).toHaveLength(20)
    expect(a).toEqual(b)
  })

  it('honours a seed for reproducible alternate datasets', () => {
    const s1 = createMockCommitSource(1).load()
    const s2 = createMockCommitSource(1).load()
    const s3 = createMockCommitSource(2).load()
    expect(s1).toEqual(s2)
    expect(s1).not.toEqual(s3)
  })
})
