import type {
  BundleModule,
  CommitData,
  FileChange,
  RegressionType,
  Vitals,
} from './types'

const TOTAL_COMMITS = 20

// mulberry32 — seeded PRNG so the dataset is reproducible across reloads
const mulberry32 = (seed: number): (() => number) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const AUTHORS = ['maya.chen', 'devon.r', 'priya.k', 'sam.okafor', 'lukas.w']

const FEATURE_MESSAGES = [
  'refactor: extract dashboard hooks',
  'feat: add commit filtering to sidebar',
  'chore: bump eslint to v10',
  'fix: correct timezone in date labels',
  'feat: keyboard nav for metric cards',
  'refactor: memoize chart selectors',
  'style: tighten card spacing scale',
  'test: cover threshold edge cases',
  'feat: empty-state for alert center',
  'chore: dedupe vendor chunks',
  'fix: guard against NaN in ROI calc',
  'feat: sparkline on metric cards',
  'refactor: split bundle treemap layout',
  'docs: document the data engine',
  'perf: lazy-load the deep-dive route',
  'feat: persist ROI assumptions',
]

const FILE_POOL = [
  'src/features/timeline/CommitChart.tsx',
  'src/store/useRoiStore.ts',
  'src/components/organisms/MetricsGrid.tsx',
  'src/lib/format.ts',
  'src/data/generateCommits.ts',
  'src/components/atoms/Button.tsx',
  'src/hooks/useVitals.ts',
  'src/routes/deep-dive.tsx',
]

const makeHash = (rng: () => number): string => {
  const hex = '0123456789abcdef'
  let out = ''
  for (let i = 0; i < 7; i++) out += hex[Math.floor(rng() * 16)]
  return out
}

const pick = <T>(rng: () => number, arr: T[]): T =>
  arr[Math.floor(rng() * arr.length)]

const round = (value: number, dp: number): number => {
  const f = 10 ** dp
  return Math.round(value * f) / f
}

const baselineVitals = (rng: () => number): Vitals => ({
  lcp: round(1.15 + (rng() - 0.5) * 0.45, 2),
  inp: round(150 + (rng() - 0.5) * 60, 0),
  cls: round(0.05 + (rng() - 0.5) * 0.04, 3),
})

const makeFilesChanged = (rng: () => number, count: number): FileChange[] => {
  const files: FileChange[] = []
  const used = new Set<string>()
  for (let i = 0; i < count; i++) {
    let path = pick(rng, FILE_POOL)
    let guard = 0
    while (used.has(path) && guard++ < 5) path = pick(rng, FILE_POOL)
    used.add(path)
    files.push({
      path,
      additions: Math.floor(rng() * 60) + 3,
      deletions: Math.floor(rng() * 30),
    })
  }
  return files
}

const BASE_BUNDLE: BundleModule[] = [
  {
    name: 'react-dom',
    sizeKb: 132,
    isNew: false,
    category: 'framework',
    importedBy: ['src/main.tsx'],
    note: 'The renderer. Unavoidable baseline weight for a React app.',
  },
  {
    name: 'react',
    sizeKb: 7,
    isNew: false,
    category: 'framework',
    importedBy: ['src/main.tsx', 'everywhere'],
  },
  {
    name: 'recharts',
    sizeKb: 96,
    isNew: false,
    category: 'vendor',
    importedBy: ['src/components/organisms/CommitStreamChart.tsx'],
    note: 'Charting library. Already isolated to the timeline route chunk via lazy loading.',
  },
  {
    name: 'd3-shape',
    sizeKb: 28,
    isNew: false,
    category: 'vendor',
    importedBy: ['recharts'],
    note: 'Transitive dependency of recharts.',
  },
  {
    name: 'zustand',
    sizeKb: 4,
    isNew: false,
    category: 'vendor',
    importedBy: ['src/store/useRoiStore.ts'],
  },
  {
    name: 'app/components',
    sizeKb: 41,
    isNew: false,
    category: 'app',
    importedBy: ['src/pages/*'],
  },
  { name: 'app/routes', sizeKb: 18, isNew: false, category: 'app', importedBy: ['src/App.tsx'] },
  { name: 'app/store', sizeKb: 6, isNew: false, category: 'app', importedBy: ['src/pages/RoiPage.tsx'] },
  { name: 'css', sizeKb: 14, isNew: false, category: 'assets', importedBy: ['src/index.css'] },
]

// `at` is the commit index (oldest-first) where the regression lands
interface RegressionSpec {
  at: number
  message: string
  cause: string
  type: RegressionType
  vitals: Vitals
  module?: BundleModule
  files: FileChange[]
}

const REGRESSIONS: RegressionSpec[] = [
  {
    at: 6,
    message: 'feat: add full-bleed hero illustration',
    cause:
      'Added uncompressed 5.2MB hero-image.png above the fold — it is the LCP element and blocks visual load.',
    type: 'uncompressed-image',
    vitals: { lcp: 4.82, inp: 168, cls: 0.06 },
    module: {
      name: 'hero-image.png',
      sizeKb: 5210,
      isNew: true,
      category: 'assets',
      importedBy: ['src/components/organisms/Hero.tsx'],
      note: 'Uncompressed 5.2MB PNG shipped as-is. It is the above-the-fold LCP element, so it blocks the largest paint.',
    },
    files: [
      { path: 'public/hero-image.png', additions: 0, deletions: 0 },
      {
        path: 'src/components/organisms/Hero.tsx',
        additions: 48,
        deletions: 2,
        hunk: `   return (
     <section className="hero">
-      <h1>Welcome</h1>
+      <img src="/hero-image.png" alt="" />
+      <h1>Welcome</h1>
     </section>
   )`,
      },
    ],
  },
  {
    at: 11,
    message: 'feat: add date utilities for commit grouping',
    cause:
      'Imported the full lodash bundle (+71kb) without tree-shaking — inflates JS parse/eval and delays interactivity.',
    type: 'unoptimized-dependency',
    vitals: { lcp: 1.42, inp: 430, cls: 0.07 },
    module: {
      name: 'lodash',
      sizeKb: 71,
      isNew: true,
      category: 'vendor',
      importedBy: ['src/lib/dates.ts'],
      note: 'Imported as the full default package (`import _ from "lodash"`). The bundler cannot tree-shake it, so all 71kb ship and parse on the main thread.',
    },
    files: [
      {
        path: 'src/lib/dates.ts',
        additions: 34,
        deletions: 1,
        hunk: `-import { format } from './format'
+import _ from 'lodash'
+
+export const groupByDay = (commits) =>
+  _.groupBy(commits, (c) => _.split(c.date, 'T')[0])`,
      },
      { path: 'package.json', additions: 1, deletions: 0 },
    ],
  },
  {
    at: 16,
    message: 'style: switch heading font to Satoshi',
    cause:
      'Swapped the heading web font without size-adjust or reserved metrics — the late swap reflows the page and spikes layout shift.',
    type: 'layout-shift',
    vitals: { lcp: 1.38, inp: 175, cls: 0.34 },
    module: {
      name: 'satoshi.woff2',
      sizeKb: 38,
      isNew: true,
      category: 'assets',
      importedBy: ['src/index.css'],
      note: 'Web font swapped in at render time without size-adjust or reserved metrics, so headings reflow once it loads — spiking CLS.',
    },
    files: [
      {
        path: 'src/index.css',
        additions: 22,
        deletions: 4,
        hunk: `+@font-face {
+  font-family: 'Satoshi';
+  src: url('/fonts/satoshi.woff2') format('woff2');
+  /* no size-adjust / font-display — reflows on swap */
+}
-h1, h2 { font-family: system-ui; }
+h1, h2 { font-family: 'Satoshi', system-ui; }`,
      },
      { path: 'public/fonts/satoshi.woff2', additions: 0, deletions: 0 },
    ],
  },
]

export const generateCommits = (seed = 0x5717): CommitData[] => {
  const rng = mulberry32(seed)
  const regressionByIndex = new Map(REGRESSIONS.map((r) => [r.at, r]))

  // accumulated additions so the treemap shows full weight per commit, not delta
  const accumulated: BundleModule[] = []
  const commits: CommitData[] = []

  const start = new Date('2026-05-15T09:00:00Z').getTime()
  const stepMs = 24 * 60 * 60 * 1000

  for (let i = 0; i < TOTAL_COMMITS; i++) {
    const reg = regressionByIndex.get(i)
    const date = new Date(start + i * stepMs + Math.floor(rng() * 6) * 3600_000)

    const carried: BundleModule[] = [
      ...BASE_BUNDLE.map((m) => ({ ...m })),
      ...accumulated.map((m) => ({ ...m, isNew: false })),
    ]

    let vitals: Vitals
    let bundleDelta: CommitData['bundleDelta'] = []
    let filesChanged: FileChange[]
    let message: string
    let isRegression = false
    let regressionCause: string | undefined
    let regressionType: RegressionType | undefined

    if (reg) {
      vitals = reg.vitals
      message = reg.message
      isRegression = true
      regressionCause = reg.cause
      regressionType = reg.type
      filesChanged = reg.files
      if (reg.module) {
        accumulated.push({ ...reg.module, isNew: false })
        carried.push({ ...reg.module, isNew: true })
        bundleDelta = [
          { name: reg.module.name, sizeKb: reg.module.sizeKb, isNew: true },
        ]
      }
    } else {
      vitals = baselineVitals(rng)
      message = FEATURE_MESSAGES[i % FEATURE_MESSAGES.length]
      filesChanged = makeFilesChanged(rng, Math.floor(rng() * 3) + 1)
      if (rng() > 0.5) {
        const sizeKb = round((rng() - 0.4) * 8, 1)
        if (Math.abs(sizeKb) >= 0.5) {
          bundleDelta = [{ name: 'app/components', sizeKb, isNew: false }]
        }
      }
    }

    commits.push({
      hash: makeHash(rng),
      author: pick(rng, AUTHORS),
      date: date.toISOString(),
      message,
      vitals,
      bundleDelta,
      bundle: carried,
      filesChanged,
      isRegression,
      regressionCause,
      regressionType,
    })
  }

  return commits
}

export const totalBundleKb = (commit: CommitData): number =>
  commit.bundle.reduce((sum, m) => sum + m.sizeKb, 0)
