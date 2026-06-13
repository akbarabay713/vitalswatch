import type { ImpactScenario } from '@/lib/roi'
import type { CommitData, RegressionType, VitalKey } from './types'

export interface Recovery {
  /** latency removed, in ms */
  delayMs?: number
  /** CLS removed */
  cls?: number
}

export interface Recommendation {
  title: string
  detail: string
  vital: VitalKey
  estimatedGain: string
  recovery: Recovery
  source: { label: string; url: string }
}

const RECOMMENDATIONS: Record<RegressionType, Recommendation[]> = {
  'uncompressed-image': [
    {
      title: 'Compress and serve responsive images',
      detail:
        'Convert the hero asset to AVIF/WebP and emit a srcset. A 5MB PNG should land under 150kb without visible quality loss.',
      vital: 'lcp',
      estimatedGain: '~3.2s LCP',
      recovery: { delayMs: 3200 },
      source: { label: 'web.dev · Optimize LCP', url: 'https://web.dev/articles/optimize-lcp' },
    },
    {
      title: 'Preload the LCP image',
      detail:
        'Add <link rel="preload" as="image"> for the above-the-fold hero so it is not discovered late in the request chain.',
      vital: 'lcp',
      estimatedGain: '~0.4s LCP',
      recovery: { delayMs: 400 },
      source: { label: 'web.dev · Preload responsive images', url: 'https://web.dev/articles/preload-responsive-images' },
    },
  ],
  'unoptimized-dependency': [
    {
      title: 'Tree-shake the dependency',
      detail:
        'Import only the functions you use (e.g. lodash-es per-method imports) so the bundler can drop the rest. Full-package imports defeat tree-shaking.',
      vital: 'inp',
      estimatedGain: '~65kb bundle · ~150ms INP',
      recovery: { delayMs: 150 },
      source: { label: 'web.dev · Reduce JS payloads', url: 'https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking' },
    },
    {
      title: 'Code-split non-critical vendors',
      detail:
        'Move the dependency behind a dynamic import so it loads after first paint instead of blocking the main thread on boot.',
      vital: 'inp',
      estimatedGain: '~80ms INP',
      recovery: { delayMs: 80 },
      source: { label: 'web.dev · Code splitting', url: 'https://web.dev/articles/reduce-javascript-payloads-with-code-splitting' },
    },
  ],
  'layout-shift': [
    {
      title: 'Reserve space with size-adjust',
      detail:
        'Add size-adjust / explicit width & height to fonts and media so swapped-in content does not reflow the page after paint.',
      vital: 'cls',
      estimatedGain: '~0.18 CLS',
      recovery: { cls: 0.18 },
      source: { label: 'web.dev · Optimize CLS', url: 'https://web.dev/articles/optimize-cls' },
    },
    {
      title: 'Use font-display: optional',
      detail:
        'Avoid the FOUT reflow on web-font swap by rendering the fallback and only upgrading on a cache hit.',
      vital: 'cls',
      estimatedGain: '~0.05 CLS',
      recovery: { cls: 0.05 },
      source: { label: 'web.dev · font-display', url: 'https://web.dev/articles/font-display' },
    },
  ],
  'render-blocking': [
    {
      title: 'Defer render-blocking resources',
      detail:
        'Move blocking scripts to defer/async and inline only critical CSS so the browser can paint before fetching the long tail.',
      vital: 'lcp',
      estimatedGain: '~1.1s LCP',
      recovery: { delayMs: 1100 },
      source: { label: 'web.dev · Render-blocking resources', url: 'https://web.dev/articles/render-blocking-resources' },
    },
  ],
  'main-thread-block': [
    {
      title: 'Break up long tasks',
      detail:
        'Yield to the main thread (scheduler.yield / chunked work) so interactions are not queued behind a single long synchronous task.',
      vital: 'inp',
      estimatedGain: '~120ms INP',
      recovery: { delayMs: 120 },
      source: { label: 'web.dev · Optimize long tasks', url: 'https://web.dev/articles/optimize-long-tasks' },
    },
  ],
}

export const getRecommendations = (commit: CommitData): Recommendation[] => {
  if (!commit.regressionType) return []
  return RECOMMENDATIONS[commit.regressionType] ?? []
}

const round3 = (n: number) => Math.round(n * 1000) / 1000

export const applyRecoveries = (
  scenario: ImpactScenario,
  recommendations: Recommendation[],
): ImpactScenario => {
  let delayMs = scenario.addedDelayMs
  let cls = scenario.addedCls
  for (const rec of recommendations) {
    delayMs -= rec.recovery.delayMs ?? 0
    cls -= rec.recovery.cls ?? 0
  }
  return {
    addedDelayMs: Math.max(0, delayMs),
    addedCls: Math.max(0, round3(cls)),
  }
}
