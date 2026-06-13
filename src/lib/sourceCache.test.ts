// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { clearCache, readCache, writeCache } from './sourceCache'
import type { CommitData } from '@/data/types'

const sample: CommitData[] = [
  {
    hash: 'abc1234',
    author: 'akbar',
    date: '2026-06-13T00:00:00.000Z',
    message: 'test',
    vitals: { lcp: 2.1, inp: 150, cls: 0.04 },
    bundleDelta: [],
    bundle: [],
    filesChanged: [],
    isRegression: false,
  },
]

beforeEach(() => localStorage.clear())

describe('sourceCache', () => {
  it('round-trips commits with a fetch timestamp', () => {
    writeCache('psi:x', sample, 1_700_000_000_000)
    const hit = readCache('psi:x')
    expect(hit?.commits).toEqual(sample)
    expect(hit?.fetchedAt).toBe(1_700_000_000_000)
  })

  it('returns null for a missing key', () => {
    expect(readCache('nope')).toBeNull()
  })

  it('isolates entries by key', () => {
    writeCache('a', sample, 1)
    expect(readCache('b')).toBeNull()
    expect(readCache('a')?.commits).toEqual(sample)
  })

  it('clears a single entry', () => {
    writeCache('a', sample, 1)
    clearCache('a')
    expect(readCache('a')).toBeNull()
  })

  it('rejects a payload from an older cache version', () => {
    localStorage.setItem(
      'vitalswatch-cache:old',
      JSON.stringify({ commits: sample, fetchedAt: 1, version: 0 }),
    )
    expect(readCache('old')).toBeNull()
  })

  it('survives a corrupt JSON entry', () => {
    localStorage.setItem('vitalswatch-cache:bad', '{not json')
    expect(readCache('bad')).toBeNull()
  })
})
