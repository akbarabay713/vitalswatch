import { describe, expect, it } from 'vitest'
import { deriveAlerts } from './alerts'
import { generateCommits } from './generateCommits'

describe('deriveAlerts', () => {
  const commits = generateCommits()
  const alerts = deriveAlerts(commits)

  it('emits one alert per regression commit', () => {
    const regressionCount = commits.filter((c) => c.isRegression).length
    expect(alerts).toHaveLength(regressionCount)
  })

  it('orders alerts newest-first', () => {
    for (let i = 1; i < alerts.length; i++) {
      expect(new Date(alerts[i - 1].date).getTime()).toBeGreaterThanOrEqual(
        new Date(alerts[i].date).getTime(),
      )
    }
  })

  it('selects the vital that worsened most as the headline vital', () => {
    // The hero-image commit's dominant regression is LCP.
    const heroHash = commits.find(
      (c) => c.regressionType === 'uncompressed-image',
    )!.hash
    const heroAlert = alerts.find((a) => a.commitHash === heroHash)!
    expect(heroAlert.vital).toBe('lcp')
    expect(heroAlert.to).toBeGreaterThan(heroAlert.from)
  })

  it('builds a human-readable headline referencing the commit', () => {
    const alert = alerts[0]
    expect(alert.headline).toContain(alert.commitHash)
    expect(alert.headline).toMatch(/dropped/i)
  })

  it('carries the regression cause through to the alert', () => {
    expect(alerts.every((a) => typeof a.cause === 'string' && a.cause.length)).toBe(
      true,
    )
  })
})
