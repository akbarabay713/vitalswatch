import { describe, expect, it } from 'vitest'
import { generateCommits, totalBundleKb } from './generateCommits'

describe('generateCommits', () => {
  it('is deterministic for a given seed', () => {
    const a = generateCommits(123)
    const b = generateCommits(123)
    expect(a).toEqual(b)
  })

  it('produces different data for different seeds', () => {
    const a = generateCommits(1)
    const b = generateCommits(2)
    expect(a).not.toEqual(b)
  })

  it('generates exactly 20 commits in chronological order', () => {
    const commits = generateCommits()
    expect(commits).toHaveLength(20)
    for (let i = 1; i < commits.length; i++) {
      expect(new Date(commits[i].date).getTime()).toBeGreaterThan(
        new Date(commits[i - 1].date).getTime(),
      )
    }
  })

  it('hand-authors exactly three regressions, each with a cause and type', () => {
    const regressions = generateCommits().filter((c) => c.isRegression)
    expect(regressions).toHaveLength(3)
    for (const r of regressions) {
      expect(r.regressionCause).toBeTruthy()
      expect(r.regressionType).toBeTruthy()
    }
  })

  it('includes the baseline bundle modules in every commit', () => {
    const commits = generateCommits()
    for (const c of commits) {
      const names = c.bundle.map((m) => m.name)
      expect(names).toContain('react-dom')
      expect(names).toContain('recharts')
    }
  })

  it('introduces the 5MB hero image at its regression and carries it forward', () => {
    const commits = generateCommits()
    const heroIdx = commits.findIndex((c) =>
      c.bundleDelta.some((d) => d.name === 'hero-image.png' && d.isNew),
    )
    expect(heroIdx).toBeGreaterThan(-1)
    // Marked "new" only on the introducing commit.
    expect(
      commits[heroIdx].bundle.find((m) => m.name === 'hero-image.png')?.isNew,
    ).toBe(true)
    // Still present, but not "new", on the following commit.
    const next = commits[heroIdx + 1]
    const carried = next.bundle.find((m) => m.name === 'hero-image.png')
    expect(carried).toBeDefined()
    expect(carried?.isNew).toBe(false)
  })

  it('totalBundleKb sums the full bundle composition', () => {
    const commit = generateCommits()[0]
    const expected = commit.bundle.reduce((s, m) => s + m.sizeKb, 0)
    expect(totalBundleKb(commit)).toBe(expected)
  })

  it('carries drill-down metadata on the regression module', () => {
    const commits = generateCommits()
    const heroCommit = commits.find((c) =>
      c.bundle.some((m) => m.name === 'hero-image.png'),
    )!
    const hero = heroCommit.bundle.find((m) => m.name === 'hero-image.png')!
    expect(hero.importedBy).toContain('src/components/organisms/Hero.tsx')
    expect(hero.note).toBeTruthy()
  })

  it('authors a diff hunk on the regression-bearing file', () => {
    const commits = generateCommits()
    const lodashCommit = commits.find(
      (c) => c.regressionType === 'unoptimized-dependency',
    )!
    const withHunk = lodashCommit.filesChanged.find((f) => f.hunk)
    expect(withHunk).toBeDefined()
    expect(withHunk?.hunk).toContain("import _ from 'lodash'")
  })
})
