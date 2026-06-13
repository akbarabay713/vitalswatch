import { describe, expect, it } from 'vitest'
import { COMMITS } from './dataset'
import { compareCommits } from './compare'

const byType = (type: string) => COMMITS.find((c) => c.regressionType === type)!
const indexOf = (hash: string) => COMMITS.findIndex((c) => c.hash === hash)

describe('compareCommits', () => {
  it('reports per-vital deltas with both ratings', () => {
    const hero = byType('uncompressed-image')
    const prev = COMMITS[indexOf(hero.hash) - 1]
    const cmp = compareCommits(prev, hero)

    const lcp = cmp.vitals.find((v) => v.vital === 'lcp')!
    expect(lcp.b).toBe(hero.vitals.lcp)
    expect(lcp.a).toBe(prev.vitals.lcp)
    expect(lcp.delta).toBeGreaterThan(0) // hero is worse
    expect(lcp.ratingA).toBe('good')
    expect(lcp.ratingB).toBe('poor')
  })

  it('flags a newly added heavy module', () => {
    const hero = byType('uncompressed-image')
    const prev = COMMITS[indexOf(hero.hash) - 1]
    const cmp = compareCommits(prev, hero)

    const added = cmp.modules.find((m) => m.name === 'hero-image.png')
    expect(added).toBeDefined()
    expect(added?.status).toBe('added')
    expect(added?.deltaKb).toBeGreaterThan(5000)
    // Largest change should sort first.
    expect(cmp.modules[0].name).toBe('hero-image.png')
  })

  it('treats the reverse direction as a removal', () => {
    const hero = byType('uncompressed-image')
    const prev = COMMITS[indexOf(hero.hash) - 1]
    const cmp = compareCommits(hero, prev)
    const removed = cmp.modules.find((m) => m.name === 'hero-image.png')
    expect(removed?.status).toBe('removed')
    expect(removed?.deltaKb).toBeLessThan(0)
  })

  it('computes bundle totals and their delta', () => {
    const hero = byType('uncompressed-image')
    const prev = COMMITS[indexOf(hero.hash) - 1]
    const cmp = compareCommits(prev, hero)
    expect(cmp.bundleDeltaKb).toBe(cmp.bundleTotalB - cmp.bundleTotalA)
    expect(cmp.bundleDeltaKb).toBeGreaterThan(5000)
  })

  it('reports no module changes when comparing a commit to itself', () => {
    const cmp = compareCommits(COMMITS[0], COMMITS[0])
    expect(cmp.modules).toHaveLength(0)
    expect(cmp.bundleDeltaKb).toBe(0)
    expect(cmp.vitals.every((v) => v.delta === 0)).toBe(true)
  })
})
