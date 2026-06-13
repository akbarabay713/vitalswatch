import { describe, expect, it } from 'vitest'
import { evaluateVitals, rate, THRESHOLDS } from '../../scripts/vitals-gate.mjs'
import { VITAL_THRESHOLDS } from './thresholds'

describe('vitals-gate', () => {
  it('passes when every vital is within the good band', () => {
    const e = evaluateVitals({ lcp: 1.2, inp: 140, cls: 0.05 })
    expect(e.pass).toBe(true)
    expect(e.failures).toHaveLength(0)
  })

  it('fails when any vital is poor', () => {
    const e = evaluateVitals({ lcp: 4.8, inp: 140, cls: 0.05 })
    expect(e.pass).toBe(false)
    expect(e.failures.map((f) => f.key)).toEqual(['lcp'])
  })

  it('warns (but does not fail) on needs-improvement', () => {
    const e = evaluateVitals({ lcp: 3.0, inp: 140, cls: 0.05 })
    expect(e.pass).toBe(true)
    expect(e.warnings.map((w) => w.key)).toEqual(['lcp'])
  })

  it('rates boundary values inclusively', () => {
    expect(rate('cls', 0.1)).toBe('good')
    expect(rate('cls', 0.25)).toBe('needs-improvement')
    expect(rate('cls', 0.26)).toBe('poor')
  })

  it('keeps the gate thresholds in sync with the app thresholds', () => {
    // Single source of truth, enforced: the CI gate and the dashboard must
    // score vitals identically or the gate would lie.
    expect(THRESHOLDS).toEqual(VITAL_THRESHOLDS)
  })
})
