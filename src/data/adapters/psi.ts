import type { CommitData } from '@/data/types'
import type { CommitSource } from '@/data/source'

export interface PsiConfig {
  url: string
  apiKey?: string
  strategy?: 'mobile' | 'desktop'
}

interface LhrAudit {
  numericValue?: number
}

interface PsiResponse {
  lighthouseResult: {
    requestedUrl: string
    fetchTime: string
    audits: {
      'largest-contentful-paint'?: LhrAudit
      'interaction-to-next-paint'?: LhrAudit
      'cumulative-layout-shift'?: LhrAudit
      'total-blocking-time'?: LhrAudit
    }
  }
  error?: { message: string }
}

const psiAuditToCommit = (
  lhr: PsiResponse['lighthouseResult'],
  strategy: string,
): CommitData => {
  const a = lhr.audits
  // LCP is in ms from the audit — convert to seconds for our Vitals type
  const lcpMs = a['largest-contentful-paint']?.numericValue ?? 0
  // Prefer INP; fall back to TBT as a proxy for older Lighthouse versions
  const inp =
    a['interaction-to-next-paint']?.numericValue ??
    a['total-blocking-time']?.numericValue ??
    0
  const cls = a['cumulative-layout-shift']?.numericValue ?? 0

  // Build a short hash-like id from the timestamp
  const hash = lhr.fetchTime.replace(/\D/g, '').slice(4, 11)

  return {
    hash,
    author: 'PageSpeed Insights',
    date: lhr.fetchTime,
    message: `${strategy} audit · ${lhr.requestedUrl}`,
    vitals: {
      lcp: +( lcpMs / 1000).toFixed(2),
      inp: Math.round(inp),
      cls: +cls.toFixed(3),
    },
    bundleDelta: [],
    bundle: [],
    filesChanged: [],
    isRegression: false,
  }
}

export const createPsiSource = (config: PsiConfig): CommitSource => {
  const strategy = config.strategy ?? 'mobile'
  let hostname = config.url
  try { hostname = new URL(config.url).hostname } catch { /* keep raw */ }

  return {
    id: 'psi',
    label: `PageSpeed Insights · ${hostname}`,
    cacheKey: `psi:${config.url}:${strategy}`,
    load: async () => {
      const params = new URLSearchParams({
        url: config.url,
        strategy,
        category: 'performance',
      })
      if (config.apiKey) params.set('key', config.apiKey)

      const res = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      )
      const data: PsiResponse = await res.json()

      if (!res.ok || data.error) {
        throw new Error(
          data.error?.message ?? `PSI API error ${res.status}`,
        )
      }

      return [psiAuditToCommit(data.lighthouseResult, strategy)]
    },
  }
}
