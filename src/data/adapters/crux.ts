import type { CommitData } from '@/data/types'
import type { CommitSource } from '@/data/source'

export interface CruxConfig {
  // CrUX keys on an origin or a specific URL — origin gives broader coverage
  origin: string
  apiKey: string
  formFactor?: 'PHONE' | 'DESKTOP' | 'TABLET'
}

interface CruxMetric {
  percentiles?: { p75?: number | string }
}

interface CollectionPeriod {
  lastDate?: { year: number; month: number; day: number }
}

interface CruxRecord {
  key: { origin?: string; url?: string }
  metrics: {
    largest_contentful_paint?: CruxMetric
    interaction_to_next_paint?: CruxMetric
    cumulative_layout_shift?: CruxMetric
  }
  collectionPeriod?: CollectionPeriod
}

interface CruxResponse {
  record?: CruxRecord
  error?: { message: string }
}

const p75 = (m?: CruxMetric): number => Number(m?.percentiles?.p75 ?? 0)

const isoFromPeriod = (period?: CollectionPeriod): string => {
  const d = period?.lastDate
  if (!d) return ''
  const mm = String(d.month).padStart(2, '0')
  const dd = String(d.day).padStart(2, '0')
  return `${d.year}-${mm}-${dd}T00:00:00.000Z`
}

const recordToCommit = (record: CruxRecord, formFactor: string): CommitData => {
  const m = record.metrics
  // CrUX LCP/INP are in ms; CLS is unitless ×100 in some payloads but p75 is raw
  const lcpMs = p75(m.largest_contentful_paint)
  const inp = p75(m.interaction_to_next_paint)
  const cls = p75(m.cumulative_layout_shift)
  const date = isoFromPeriod(record.collectionPeriod) || ''

  // Synthesize a stable id from the collection period
  const hash = date ? date.replace(/\D/g, '').slice(0, 7) : 'crux'

  return {
    hash,
    author: 'Chrome UX Report',
    date,
    message: `${formFactor} field data · ${record.key.origin ?? record.key.url ?? ''}`,
    vitals: {
      lcp: +(lcpMs / 1000).toFixed(2),
      inp: Math.round(inp),
      cls: +Number(cls).toFixed(3),
    },
    bundleDelta: [],
    bundle: [],
    filesChanged: [],
    isRegression: false,
  }
}

export const createCruxSource = (config: CruxConfig): CommitSource => {
  const formFactor = config.formFactor ?? 'PHONE'
  let hostname = config.origin
  try { hostname = new URL(config.origin).hostname } catch { /* keep raw */ }

  return {
    id: 'crux',
    label: `CrUX field data · ${hostname}`,
    load: async () => {
      const res = await fetch(
        `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(config.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: config.origin,
            formFactor,
            metrics: [
              'largest_contentful_paint',
              'interaction_to_next_paint',
              'cumulative_layout_shift',
            ],
          }),
        },
      )
      const data: CruxResponse = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error?.message ?? `CrUX API error ${res.status}`)
      }
      if (!data.record) {
        throw new Error('No field data available for this origin')
      }

      return [recordToCommit(data.record, formFactor)]
    },
  }
}
