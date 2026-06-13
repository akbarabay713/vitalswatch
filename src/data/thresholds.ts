import type { VitalKey, VitalRating, Vitals } from './types'
import { formatMs, formatSeconds } from '@/lib/format'

// https://web.dev/articles/vitals
export const VITAL_THRESHOLDS: Record<VitalKey, { good: number; needs: number }> = {
  lcp: { good: 2.5, needs: 4.0 },
  inp: { good: 200, needs: 500 },
  cls: { good: 0.1, needs: 0.25 },
}

export interface VitalMeta {
  key: VitalKey
  label: string
  full: string
  unit: string
  description: string
  format: (value: number) => string
}

export const VITAL_META: Record<VitalKey, VitalMeta> = {
  lcp: {
    key: 'lcp',
    label: 'LCP',
    full: 'Largest Contentful Paint',
    unit: 's',
    description: 'Visual load speed — when the main content becomes visible.',
    format: formatSeconds,
  },
  inp: {
    key: 'inp',
    label: 'INP',
    full: 'Interaction to Next Paint',
    unit: 'ms',
    description: 'Responsiveness — lag between an interaction and its paint.',
    format: formatMs,
  },
  cls: {
    key: 'cls',
    label: 'CLS',
    full: 'Cumulative Layout Shift',
    unit: '',
    description: 'Visual stability — how much the layout unexpectedly moves.',
    format: (v) => v.toFixed(3),
  },
}

export const VITAL_ORDER: VitalKey[] = ['lcp', 'inp', 'cls']

export const rateVital = (key: VitalKey, value: number): VitalRating => {
  const { good, needs } = VITAL_THRESHOLDS[key]
  if (value <= good) return 'good'
  if (value <= needs) return 'needs-improvement'
  return 'poor'
}

export const rateCommit = (vitals: Vitals): VitalRating => {
  const ratings = VITAL_ORDER.map((k) => rateVital(k, vitals[k]))
  if (ratings.includes('poor')) return 'poor'
  if (ratings.includes('needs-improvement')) return 'needs-improvement'
  return 'good'
}
