import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPsiSource } from './psi'

const mockFetch = (body: unknown, ok = true, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok, status, json: () => Promise.resolve(body) })),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('createPsiSource', () => {
  it('maps the PSI lighthouseResult into a single commit', async () => {
    mockFetch({
      lighthouseResult: {
        requestedUrl: 'https://example.com/',
        fetchTime: '2026-06-13T10:00:00.000Z',
        audits: {
          'largest-contentful-paint': { numericValue: 3200 },
          'interaction-to-next-paint': { numericValue: 210 },
          'cumulative-layout-shift': { numericValue: 0.12 },
        },
      },
    })
    const src = createPsiSource({ url: 'https://example.com', strategy: 'mobile' })
    const commits = await src.load()
    expect(commits).toHaveLength(1)
    expect(commits[0].vitals).toEqual({ lcp: 3.2, inp: 210, cls: 0.12 })
    expect(commits[0].author).toBe('PageSpeed Insights')
  })

  it('labels the source with the hostname', () => {
    const src = createPsiSource({ url: 'https://shop.example.com/cart' })
    expect(src.label).toContain('shop.example.com')
  })

  it('throws the API error message on a failed response', async () => {
    mockFetch({ error: { message: 'Rate limit exceeded' } }, false, 429)
    const src = createPsiSource({ url: 'https://example.com' })
    await expect(src.load()).rejects.toThrow('Rate limit exceeded')
  })

  it('passes the API key when provided', async () => {
    const fetchSpy = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            lighthouseResult: {
              requestedUrl: 'https://example.com/',
              fetchTime: '2026-06-13T10:00:00.000Z',
              audits: {},
            },
          }),
      }),
    )
    vi.stubGlobal('fetch', fetchSpy)
    await createPsiSource({ url: 'https://example.com', apiKey: 'SECRET' }).load()
    expect(String(fetchSpy.mock.calls[0][0])).toContain('key=SECRET')
  })
})
