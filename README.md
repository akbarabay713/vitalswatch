# VitalsWatch

**Automated Core Web Vitals regression tracker & business-impact dashboard.**

VitalsWatch simulates a CI/CD pipeline that audits every commit for Core Web
Vitals (LCP, INP, CLS), visualises performance trends across deployments,
catches regressions before they reach production, isolates the file or
dependency responsible, and translates technical lag into estimated business
impact. No backend — a deterministic frontend simulation drives the whole app.

## Run it

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run lint     # eslint
npm test         # vitest run (unit + component)
npm run test:watch
npm run vitals-gate [report.json]   # CI Core Web Vitals regression gate
```

## The views

1. **Timeline** (`/`) — global performance over the last 20 commits: a metrics
   grid (with per-vital sparklines) for current production health, an
   interactive Recharts commit-stream chart with the good/poor thresholds drawn
   as reference lines, and an alert center listing deployments that tripped a
   regression.
2. **Commit deep-dive** (`/commits/:hash`) — isolates one deployment: a custom
   flexbox bundle-analyzer treemap (heavy new dependencies highlighted), a
   files-changed + size-delta list, and recommendations generated from the
   commit's regression cause — each with a "what if we fix it" toggle that
   recomputes the recovered revenue. Searchable commit selector.
3. **Compare** (`/compare`) — diff any two commits side by side: per-vital
   deltas with both ratings, and a bundle module diff (added/removed/changed).
4. **Business impact** (`/roi`) — a live ROI calculator pricing two conversion
   channels (latency + layout shift), each as an adjustable assumption slider,
   plus a sensitivity curve sweeping the assumption across its range — so
   projected cost is the output of a tunable model, not a hardcoded fact. An
   "Export PDF" button produces a print-optimized report via the browser's
   Save-as-PDF (no dependency).

## Architecture

**Atomic design** under `src/components/`:

| Layer | Examples |
| --- | --- |
| `atoms/` | `Button`, `Badge`, `Card`, `Slider`, `Stat`, `Hash`, `Delta`, `Sparkline` |
| `molecules/` | `MetricCard`, `AlertItem`, `FileChangeRow`, `SliderControl`, `TreemapTile`, `RecommendationCard`, `ThemeToggle` |
| `organisms/` | `CommitStreamChart`, `MetricsGrid`, `AlertCenter`, `BundleTreemap`, `FilesChangedList`, `RecommendationsPanel`, `RoiSimulator`, `SensitivityChart`, `RoiReport`, `CommitCompare`, `AppSidebar` |
| `templates/` | `DashboardLayout`, `PageHeader` |
| `pages/` | `TimelinePage`, `CommitDeepDivePage`, `ComparePage`, `RoiPage`, `ErrorPage` |

**CVA pattern** — every styled atom defines its visual variants with
[`class-variance-authority`](https://cva.style) (see `Button`, `Badge`, `Card`,
`Stat`, `TreemapTile`). Class conflicts are resolved through the shared `cn()`
helper (`clsx` + `tailwind-merge`) in `src/lib/cn.ts`.

**Data engine** (`src/data/`) — the backbone everything reads from:

- `source.ts` — the `CommitSource` seam. The whole app reads its data through
  this interface, so the mock engine can be swapped for a real source (Lighthouse
  CI / CrUX) in one place. The active source's label is shown in the sidebar.
- `generateCommits.ts` — seeded (deterministic) generator: 20 commits of
  baseline vitals + jitter, plus three hand-authored regression commits with
  named causes (5.2MB uncompressed hero image, un-tree-shaken lodash, font swap
  without `size-adjust`), each carrying bundle import metadata and a diff hunk.
- `thresholds.ts` — official Web Vitals scoring boundaries and rating logic.
- `recommendations.ts` — the regression-cause → remediation knowledge base,
  with structured recovery gains driving the "what if we fix it" projection.
- `alerts.ts` / `impact.ts` / `compare.ts` — derived alert feed, latency+CLS
  business-impact model, and commit-to-commit diff.

**CI regression gate** — `scripts/vitals-gate.mjs` scores a vitals report
against the same Web Vitals thresholds and fails the build on a poor metric;
`.github/workflows/ci.yml` runs lint → test → build → gate. A test asserts the
gate and the dashboard share thresholds, so they can never drift.

**State** — `zustand`: `useRoiStore` holds the ROI assumptions so tuning the
model on the ROI page flows through to the deep-dive figures (persisted to
`localStorage`); `useThemeStore` holds the dark/light theme, applied to
`<html data-theme>` before first paint.

**Theming & responsive** — a single set of scoped CSS-token overrides
(`:root[data-theme='light']`) re-themes every utility, Recharts color, and badge.
Below `md` the sidebar collapses into a slide-in drawer behind a top bar.

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · class-variance-authority ·
Recharts · Zustand · React Router. Routes are code-split via `React.lazy` to
keep the chart-heavy timeline out of the other chunks — the same technique the
app recommends for its "unoptimized dependency" regression.
