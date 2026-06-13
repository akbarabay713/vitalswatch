import { describe, expect, it } from 'vitest'
import { COMMITS } from './dataset'
import { commitScenario } from './impact'
import { applyRecoveries, getRecommendations } from './recommendations'

const byType = (type: string) => COMMITS.find((c) => c.regressionType === type)!

describe('getRecommendations', () => {
  it('returns remediations for a classified regression', () => {
    const recs = getRecommendations(byType('uncompressed-image'))
    expect(recs.length).toBeGreaterThan(0)
    expect(recs.every((r) => r.recovery)).toBe(true)
  })

  it('returns nothing for a non-regression commit', () => {
    const normal = COMMITS.find((c) => !c.isRegression)!
    expect(getRecommendations(normal)).toEqual([])
  })
})

describe('applyRecoveries', () => {
  it('subtracts latency recoveries from the scenario', () => {
    const scenario = { addedDelayMs: 3600, addedCls: 0 }
    const recs = getRecommendations(byType('uncompressed-image')) // 3200 + 400
    const recovered = applyRecoveries(scenario, recs)
    expect(recovered.addedDelayMs).toBe(0)
    expect(recovered.addedCls).toBe(0)
  })

  it('subtracts CLS recoveries from the scenario', () => {
    const scenario = { addedDelayMs: 0, addedCls: 0.3 }
    const recs = getRecommendations(byType('layout-shift')) // 0.18 + 0.05
    const recovered = applyRecoveries(scenario, recs)
    expect(recovered.addedCls).toBeCloseTo(0.07, 3)
  })

  it('never drives impact below zero', () => {
    const recs = getRecommendations(byType('uncompressed-image'))
    const recovered = applyRecoveries({ addedDelayMs: 100, addedCls: 0 }, recs)
    expect(recovered.addedDelayMs).toBe(0)
  })

  it('applying a real commit scenario with all fixes recovers most impact', () => {
    const hero = byType('uncompressed-image')
    const scenario = commitScenario(hero)
    const recovered = applyRecoveries(scenario, getRecommendations(hero))
    expect(recovered.addedDelayMs).toBeLessThan(scenario.addedDelayMs)
  })

  it('applying no fixes leaves the scenario unchanged', () => {
    const scenario = { addedDelayMs: 500, addedCls: 0.1 }
    expect(applyRecoveries(scenario, [])).toEqual(scenario)
  })
})
