import { describe, expect, it } from 'vitest'
import { COMMITS } from './dataset'
import {
  commitAddedCls,
  commitAddedDelayMs,
  commitScenario,
  hasImpact,
  impactScenarios,
  regressionScenarios,
} from './impact'

const byType = (type: string) =>
  COMMITS.find((c) => c.regressionType === type)!

describe('commitAddedDelayMs', () => {
  it('prices an LCP regression off its LCP worsening', () => {
    const hero = byType('uncompressed-image')
    expect(commitAddedDelayMs(hero)).toBeGreaterThan(3000)
  })

  it('prices an INP regression off its INP worsening', () => {
    const lodash = byType('unoptimized-dependency')
    expect(commitAddedDelayMs(lodash)).toBeGreaterThan(100)
  })

  it('does not price a layout-shift regression as latency', () => {
    expect(commitAddedDelayMs(byType('layout-shift'))).toBe(0)
  })

  it('returns 0 for non-regression commits', () => {
    const normal = COMMITS.find((c) => !c.isRegression)!
    expect(commitAddedDelayMs(normal)).toBe(0)
  })
})

describe('commitAddedCls', () => {
  it('prices the layout-shift regression off its CLS worsening', () => {
    expect(commitAddedCls(byType('layout-shift'))).toBeGreaterThan(0.1)
  })

  it('does not attribute CLS to latency regressions', () => {
    expect(commitAddedCls(byType('uncompressed-image'))).toBe(0)
    expect(commitAddedCls(byType('unoptimized-dependency'))).toBe(0)
  })
})

describe('commitScenario / hasImpact', () => {
  it('builds a combined scenario per commit', () => {
    const s = commitScenario(byType('layout-shift'))
    expect(s.addedDelayMs).toBe(0)
    expect(s.addedCls).toBeGreaterThan(0)
  })

  it('flags every regression as having priced impact', () => {
    for (const c of regressionScenarios()) {
      expect(hasImpact(c)).toBe(true)
    }
  })
})

describe('scenarios', () => {
  it('regressionScenarios returns all three regressions, newest first', () => {
    const s = regressionScenarios()
    expect(s).toHaveLength(3)
    expect(new Date(s[0].date).getTime()).toBeGreaterThan(
      new Date(s[2].date).getTime(),
    )
  })

  it('impactScenarios now includes the CLS regression (all three priced)', () => {
    const s = impactScenarios()
    expect(s).toHaveLength(3)
    expect(s.some((c) => c.regressionType === 'layout-shift')).toBe(true)
  })
})
