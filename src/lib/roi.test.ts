import { describe, expect, it } from 'vitest'
import { DEFAULT_ASSUMPTIONS, projectImpact, type RoiAssumptions } from './roi'

describe('projectImpact', () => {
  const base: RoiAssumptions = {
    monthlyVisitors: 100_000,
    conversionRate: 2, // 2%
    averageOrderValue: 100,
    impactPer100ms: 1, // 1% conversion loss per 100ms
    impactPerTenthCls: 2, // 2% conversion loss per 0.1 CLS
  }

  it('returns zero loss when the scenario has no impact', () => {
    const p = projectImpact(base, { addedDelayMs: 0, addedCls: 0 })
    expect(p.monthlyLoss).toBe(0)
    expect(p.conversionDropFraction).toBe(0)
    expect(p.projectedRevenue).toBe(p.baselineRevenue)
  })

  it('prices the latency channel from the documented formula', () => {
    // 200ms → 200/100 * 1% = 2% drop.
    // baseConversions = 100k * 2% = 2000; baseline revenue = 2000 * $100 = $200k.
    // lost = 2000 * 0.02 = 40 conversions → $4,000/mo.
    const p = projectImpact(base, { addedDelayMs: 200, addedCls: 0 })
    expect(p.latencyDropFraction).toBeCloseTo(0.02, 6)
    expect(p.clsDropFraction).toBe(0)
    expect(p.baselineRevenue).toBe(200_000)
    expect(p.lostConversions).toBeCloseTo(40, 6)
    expect(p.monthlyLoss).toBeCloseTo(4_000, 6)
  })

  it('prices the layout-shift channel from added CLS', () => {
    // 0.2 CLS → 0.2/0.1 * 2% = 4% drop → lost = 2000 * 0.04 = 80 → $8,000/mo.
    const p = projectImpact(base, { addedDelayMs: 0, addedCls: 0.2 })
    expect(p.clsDropFraction).toBeCloseTo(0.04, 6)
    expect(p.latencyDropFraction).toBe(0)
    expect(p.monthlyLoss).toBeCloseTo(8_000, 6)
  })

  it('sums the two channels', () => {
    const p = projectImpact(base, { addedDelayMs: 200, addedCls: 0.2 })
    expect(p.conversionDropFraction).toBeCloseTo(0.06, 6) // 2% + 4%
    expect(p.monthlyLoss).toBeCloseTo(12_000, 6)
  })

  it('clamps the combined drop so revenue never goes negative', () => {
    const p = projectImpact(
      { ...base, impactPer100ms: 3, impactPerTenthCls: 5 },
      { addedDelayMs: 100_000, addedCls: 10 },
    )
    expect(p.conversionDropFraction).toBe(1)
    expect(p.projectedRevenue).toBe(0)
    expect(p.monthlyLoss).toBe(p.baselineRevenue)
  })

  it('treats negative inputs (improvements) as zero impact', () => {
    const p = projectImpact(base, { addedDelayMs: -500, addedCls: -1 })
    expect(p.scenario.addedDelayMs).toBe(0)
    expect(p.scenario.addedCls).toBe(0)
    expect(p.monthlyLoss).toBe(0)
  })

  it('scales loss linearly with each assumption', () => {
    const single = projectImpact(
      { ...base, impactPer100ms: 1 },
      { addedDelayMs: 100, addedCls: 0 },
    )
    const double = projectImpact(
      { ...base, impactPer100ms: 2 },
      { addedDelayMs: 100, addedCls: 0 },
    )
    expect(double.monthlyLoss).toBeCloseTo(single.monthlyLoss * 2, 6)
  })

  it('ships sane defaults for both channels', () => {
    expect(DEFAULT_ASSUMPTIONS.impactPer100ms).toBeGreaterThan(0)
    expect(DEFAULT_ASSUMPTIONS.impactPerTenthCls).toBeGreaterThan(0)
    expect(DEFAULT_ASSUMPTIONS.conversionRate).toBeGreaterThan(0)
  })
})
