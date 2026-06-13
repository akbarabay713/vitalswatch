// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useDataStore } from './useDataStore'
import { writeCache } from '@/lib/sourceCache'
import { generateCommits } from '@/data/generateCommits'
import { createMockCommitSource } from '@/data/source'
import type { CommitData } from '@/data/types'
import type { CommitSource } from '@/data/source'

const oneCommit = (hash: string): CommitData[] => [
  {
    hash,
    author: 'PSI',
    date: '2026-06-13T00:00:00.000Z',
    message: 'live',
    vitals: { lcp: 3, inp: 200, cls: 0.1 },
    bundleDelta: [],
    bundle: [],
    filesChanged: [],
    isRegression: false,
  },
]

const fakeSource = (
  over: Partial<CommitSource> & { load: CommitSource['load'] },
): CommitSource => ({ id: 'psi', label: 'fake', ...over })

beforeEach(() => {
  localStorage.clear()
  useDataStore.setState({
    commits: generateCommits(),
    source: createMockCommitSource(),
    status: 'ready',
    error: null,
    lastUpdated: null,
  })
})

describe('useDataStore SWR', () => {
  it('loads a fresh cacheable source: loading → ready, writes cache + timestamp', async () => {
    const src = fakeSource({
      cacheKey: 'psi:fresh',
      load: () => Promise.resolve(oneCommit('fresh11')),
    })
    await useDataStore.getState().setSource(src)

    const s = useDataStore.getState()
    expect(s.status).toBe('ready')
    expect(s.commits[0].hash).toBe('fresh11')
    expect(s.lastUpdated).toBeTypeOf('number')
  })

  it('serves cached data immediately, then revalidates', async () => {
    writeCache('psi:warm', oneCommit('cached1'), 1_700_000_000_000)
    const src = fakeSource({
      cacheKey: 'psi:warm',
      load: () => Promise.resolve(oneCommit('live999')),
    })

    const pending = useDataStore.getState().setSource(src)
    // synchronously, before load() resolves: cached data is on screen
    const mid = useDataStore.getState()
    expect(mid.status).toBe('revalidating')
    expect(mid.commits[0].hash).toBe('cached1')
    expect(mid.lastUpdated).toBe(1_700_000_000_000)

    await pending
    const after = useDataStore.getState()
    expect(after.status).toBe('ready')
    expect(after.commits[0].hash).toBe('live999')
  })

  it('does not set a timestamp for a source without a cacheKey', async () => {
    const src = fakeSource({ load: () => Promise.resolve(oneCommit('nokey1')) })
    await useDataStore.getState().setSource(src)
    expect(useDataStore.getState().lastUpdated).toBeNull()
  })

  it('surfaces a load failure as an error status', async () => {
    const src = fakeSource({
      load: () => Promise.reject(new Error('429 rate limited')),
    })
    await useDataStore.getState().setSource(src)
    const s = useDataStore.getState()
    expect(s.status).toBe('error')
    expect(s.error).toBe('429 rate limited')
  })

  it('keeps stale cached data visible when revalidation fails', async () => {
    writeCache('psi:keep', oneCommit('stale11'), 1_700_000_000_000)
    const src = fakeSource({
      cacheKey: 'psi:keep',
      load: () => Promise.reject(new Error('network down')),
    })
    await useDataStore.getState().setSource(src)
    const s = useDataStore.getState()
    expect(s.status).toBe('error')
    expect(s.commits[0].hash).toBe('stale11') // stale data still shown
  })
})
