import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCruxSource } from './crux'

const mockFetch = (body: unknown, ok = true, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok, status, json: () => Promise.resolve(body) })),
  )
}

afterEach(() => vi.unstubAllGlobals())

const cfg = { origin: 'https://example.com', apiKey: 'KEY' }

describe('createCruxSource', () => {
  it('maps the P75 field metrics into vitals', async () => {
    mockFetch({
      record: {
        key: { origin: 'https://example.com' },
        metrics: {
          largest_contentful_paint: { percentiles: { p75: 2800 } },
          interaction_to_next_paint: { percentiles: { p75: 190 } },
          cumulative_layout_shift: { percentiles: { p75: '0.08' } },
        },
        collectionPeriod: { lastDate: { year: 2026, month: 6, day: 1 } },
      },
    })
    const [c] = await createCruxSource(cfg).load()
    expect(c.vitals).toEqual({ lcp: 2.8, inp: 190, cls: 0.08 })
    expect(c.author).toBe('Chrome UX Report')
    expect(c.date).toBe('2026-06-01T00:00:00.000Z')
  })

  it('throws when the origin has no field data', async () => {
    mockFetch({})
    await expect(createCruxSource(cfg).load()).rejects.toThrow(/no field data/i)
  })

  it('surfaces the API error message', async () => {
    mockFetch({ error: { message: 'API key not valid' } }, false, 400)
    await expect(createCruxSource(cfg).load()).rejects.toThrow('API key not valid')
  })

  it('POSTs the origin and form factor', async () => {
    const fetchSpy = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            record: { key: { origin: 'https://example.com' }, metrics: {} },
          }),
      }),
    )
    vi.stubGlobal('fetch', fetchSpy)
    await createCruxSource({ ...cfg, formFactor: 'DESKTOP' }).load()
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.origin).toBe('https://example.com')
    expect(body.formFactor).toBe('DESKTOP')
  })
})
