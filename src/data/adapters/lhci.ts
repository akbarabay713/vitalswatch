import type { CommitData } from '@/data/types'
import type { CommitSource } from '@/data/source'

// Minimal LHR subset the adapter needs — users provide this shape in their JSON
export interface LhciRecord {
  hash: string
  author: string
  date: string
  message: string
  url?: string
  lhr: {
    audits: {
      'largest-contentful-paint'?: { numericValue?: number }
      'interaction-to-next-paint'?: { numericValue?: number }
      'cumulative-layout-shift'?: { numericValue?: number }
      'total-blocking-time'?: { numericValue?: number }
    }
  }
}

const recordToCommit = (
  r: LhciRecord,
  idx: number,
  all: LhciRecord[],
): CommitData => {
  const a = r.lhr.audits
  const lcp = (a['largest-contentful-paint']?.numericValue ?? 0) / 1000
  const inp =
    a['interaction-to-next-paint']?.numericValue ??
    a['total-blocking-time']?.numericValue ??
    0
  const cls = a['cumulative-layout-shift']?.numericValue ?? 0

  // Auto-detect regressions as >10% worse than previous run
  const prev = idx > 0 ? all[idx - 1].lhr.audits : null
  const prevLcp = prev ? (prev['largest-contentful-paint']?.numericValue ?? 0) / 1000 : 0
  const prevInp = prev
    ? (prev['interaction-to-next-paint']?.numericValue ??
       prev['total-blocking-time']?.numericValue ??
       0)
    : 0
  const prevCls = prev ? (prev['cumulative-layout-shift']?.numericValue ?? 0) : 0
  const isRegression =
    idx > 0 &&
    (lcp > prevLcp * 1.1 || inp > prevInp * 1.1 || cls > prevCls * 1.1)

  return {
    hash: r.hash.slice(0, 7),
    author: r.author,
    date: r.date,
    message: r.message,
    vitals: {
      lcp: +lcp.toFixed(2),
      inp: Math.round(inp),
      cls: +cls.toFixed(3),
    },
    bundleDelta: [],
    bundle: [],
    filesChanged: [],
    isRegression,
  }
}

const validate = (data: unknown): LhciRecord[] => {
  if (!Array.isArray(data)) throw new Error('Expected a JSON array of run records')
  if (data.length === 0) throw new Error('JSON array is empty')
  const first = data[0] as Partial<LhciRecord>
  if (!first.hash) throw new Error('Each record must have a "hash" field')
  if (!first.lhr?.audits)
    throw new Error('Each record must have a "lhr.audits" object')
  return data as LhciRecord[]
}

export const createLhciSource = (json: unknown): CommitSource => {
  const records = validate(json)
  return {
    id: 'lhci',
    label: `Lighthouse CI · ${records.length} run${records.length === 1 ? '' : 's'}`,
    load: async () => records.map((r, i) => recordToCommit(r, i, records)),
  }
}

export const readJsonFile = (file: File): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string))
      } catch {
        reject(new Error('File is not valid JSON'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsText(file)
  })
