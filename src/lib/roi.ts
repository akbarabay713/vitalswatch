export interface RoiAssumptions {
  monthlyVisitors: number
  /** as a percentage, e.g. 2.5 = 2.5% */
  conversionRate: number
  averageOrderValue: number
  /** % of conversions lost per 100ms of added latency */
  impactPer100ms: number
  /** % of conversions lost per 0.1 of added CLS */
  impactPerTenthCls: number
}

export interface ImpactScenario {
  addedDelayMs: number
  addedCls: number
}

export interface RoiProjection {
  scenario: ImpactScenario
  latencyDropFraction: number
  clsDropFraction: number
  conversionDropFraction: number
  baselineRevenue: number
  projectedRevenue: number
  monthlyLoss: number
  annualLoss: number
  lostConversions: number
}

export const DEFAULT_ASSUMPTIONS: RoiAssumptions = {
  monthlyVisitors: 250_000,
  conversionRate: 2.5,
  averageOrderValue: 85,
  impactPer100ms: 1.0,
  impactPerTenthCls: 1.5,
}

export const ASSUMPTION_BOUNDS = {
  monthlyVisitors: { min: 10_000, max: 2_000_000, step: 10_000 },
  conversionRate: { min: 0.5, max: 10, step: 0.1 },
  averageOrderValue: { min: 10, max: 500, step: 5 },
  impactPer100ms: { min: 0, max: 3, step: 0.1 },
  impactPerTenthCls: { min: 0, max: 5, step: 0.1 },
} as const

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

export const projectImpact = (
  assumptions: RoiAssumptions,
  scenario: ImpactScenario,
): RoiProjection => {
  const {
    monthlyVisitors,
    conversionRate,
    averageOrderValue,
    impactPer100ms,
    impactPerTenthCls,
  } = assumptions

  const delay = Math.max(0, scenario.addedDelayMs)
  const cls = Math.max(0, scenario.addedCls)

  const latencyDropFraction = clamp01((delay / 100) * (impactPer100ms / 100))
  const clsDropFraction = clamp01((cls / 0.1) * (impactPerTenthCls / 100))
  const conversionDropFraction = clamp01(latencyDropFraction + clsDropFraction)

  const baseConversions = monthlyVisitors * (conversionRate / 100)
  const baselineRevenue = baseConversions * averageOrderValue

  const lostConversions = baseConversions * conversionDropFraction
  const monthlyLoss = lostConversions * averageOrderValue
  const projectedRevenue = baselineRevenue - monthlyLoss

  return {
    scenario: { addedDelayMs: delay, addedCls: cls },
    latencyDropFraction,
    clsDropFraction,
    conversionDropFraction,
    baselineRevenue,
    projectedRevenue,
    monthlyLoss,
    annualLoss: monthlyLoss * 12,
    lostConversions,
  }
}
