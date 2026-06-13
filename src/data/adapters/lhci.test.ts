import { describe, expect, it } from 'vitest'
import { createLhciSource } from './lhci'

const run = (
  hash: string,
  lcpMs: number,
  inpMs: number,
  cls: number,
  date = '2026-01-01T00:00:00.000Z',
) => ({
  hash,
  author: 'akbar',
  date,
  message: `commit ${hash}`,
  lhr: {
    audits: {
      'largest-contentful-paint': { numericValue: lcpMs },
      'interaction-to-next-paint': { numericValue: inpMs },
      'cumulative-layout-shift': { numericValue: cls },
    },
  },
})

describe('createLhciSource', () => {
  it('maps LHR audits into vitals (LCP to seconds, INP to ms, CLS raw)', async () => {
    const src = createLhciSource([run('aaaaaaa', 2400, 180, 0.05)])
    const [c] = await src.load()
    expect(c.vitals).toEqual({ lcp: 2.4, inp: 180, cls: 0.05 })
    expect(c.hash).toBe('aaaaaaa')
  })

  it('falls back to total-blocking-time when INP is absent', async () => {
    const src = createLhciSource([
      {
        hash: 'bbbbbbb',
        author: 'akbar',
        date: '2026-01-01T00:00:00.000Z',
        message: 'no inp',
        lhr: { audits: { 'total-blocking-time': { numericValue: 220 } } },
      },
    ])
    const [c] = await src.load()
    expect(c.vitals.inp).toBe(220)
  })

  it('flags a run as a regression when a vital worsens >10% vs the previous', async () => {
    const src = createLhciSource([
      run('1111111', 2000, 150, 0.05),
      run('2222222', 2500, 150, 0.05), // LCP +25%
    ])
    const commits = await src.load()
    expect(commits[0].isRegression).toBe(false)
    expect(commits[1].isRegression).toBe(true)
  })

  it('does not flag a run within the 10% tolerance', async () => {
    const src = createLhciSource([
      run('1111111', 2000, 150, 0.05),
      run('2222222', 2100, 150, 0.05), // LCP +5%
    ])
    const commits = await src.load()
    expect(commits[1].isRegression).toBe(false)
  })

  it('rejects non-array input', () => {
    expect(() => createLhciSource({})).toThrow(/array/i)
  })

  it('rejects an empty array', () => {
    expect(() => createLhciSource([])).toThrow(/empty/i)
  })

  it('rejects records missing required fields', () => {
    expect(() => createLhciSource([{ hash: 'x' }])).toThrow(/lhr\.audits/i)
    expect(() => createLhciSource([{ lhr: { audits: {} } }])).toThrow(/hash/i)
  })
})
