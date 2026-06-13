import { describe, expect, it } from 'vitest'
import { rateCommit, rateVital, VITAL_THRESHOLDS } from './thresholds'

describe('rateVital', () => {
  it('rates a value at the good boundary as good (inclusive)', () => {
    expect(rateVital('lcp', VITAL_THRESHOLDS.lcp.good)).toBe('good')
    expect(rateVital('inp', VITAL_THRESHOLDS.inp.good)).toBe('good')
    expect(rateVital('cls', VITAL_THRESHOLDS.cls.good)).toBe('good')
  })

  it('rates a value at the needs boundary as needs-improvement (inclusive)', () => {
    expect(rateVital('lcp', VITAL_THRESHOLDS.lcp.needs)).toBe('needs-improvement')
    expect(rateVital('inp', VITAL_THRESHOLDS.inp.needs)).toBe('needs-improvement')
  })

  it('rates a value just above the good boundary as needs-improvement', () => {
    expect(rateVital('lcp', VITAL_THRESHOLDS.lcp.good + 0.01)).toBe(
      'needs-improvement',
    )
  })

  it('rates a value above the needs boundary as poor', () => {
    expect(rateVital('lcp', VITAL_THRESHOLDS.lcp.needs + 0.01)).toBe('poor')
    expect(rateVital('cls', 0.5)).toBe('poor')
  })
})

describe('rateCommit', () => {
  it('is good only when every vital is good', () => {
    expect(rateCommit({ lcp: 1.0, inp: 100, cls: 0.05 })).toBe('good')
  })

  it('takes the worst rating across the three vitals', () => {
    // LCP poor dominates even with good INP/CLS.
    expect(rateCommit({ lcp: 5.0, inp: 100, cls: 0.05 })).toBe('poor')
    // A single needs-improvement with the rest good → needs-improvement.
    expect(rateCommit({ lcp: 1.0, inp: 300, cls: 0.05 })).toBe(
      'needs-improvement',
    )
  })

  it('prefers poor over needs-improvement when both are present', () => {
    expect(rateCommit({ lcp: 3.0, inp: 600, cls: 0.05 })).toBe('poor')
  })
})
