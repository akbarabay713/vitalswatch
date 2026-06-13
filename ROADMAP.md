# VitalsWatch — Roadmap

Status of the build and what comes after v1.

---

## ✅ v1 — shipped

The full brief, built vertically (one regression's journey works end-to-end:
timeline → deep-dive → ROI), then expanded to all 20 commits and three pages.

- **Data engine** — deterministic seeded generator: 20 commits (baseline +
  jitter) plus 3 hand-authored regressions with named causes. Regression →
  recommendation knowledge base.
- **Timeline page** — metrics grid, interactive Recharts commit stream with
  switchable vital + threshold reference lines, alert center.
- **Deep-dive page** — custom flexbox bundle treemap (heavy new deps flagged),
  files-changed + size-delta list, cause-driven recommendations, cross-page ROI
  callout.
- **ROI page** — adjustable-assumption ROI calculator with live recalculation.
- **Architecture** — atomic design (atoms/molecules/organisms/templates/pages),
  CVA for every styled primitive, Zustand for cross-page ROI state, route-level
  code splitting.
- **Quality gates** — `tsc -b`, `eslint`, and `vite build` all green; verified
  in-browser across all three routes.

### Explicitly cut from v1 (per brief)

- Framer Motion polish — see [Polish](#polish-nice-to-have).
- Full git diff viewer — the files-changed + size-delta list covers most of the
  value; see [Deep-dive depth](#2-deep-dive-depth).

---

## What's next

Ordered by value-to-effort. The top section is what I'd pick up first.

### 0. Harden the foundation ✅ done

The data engine is the backbone everything reads from — locked down before
building on top. Run with `npm test` (40 tests, Vitest + Testing Library).

- [x] **Unit tests** for the pure core: `rateVital`/`rateCommit` boundaries,
      `projectImpact` math (including the clamp), `commitAddedDelayMs`
      type-aware attribution, `deriveAlerts`, and the deterministic generator
      (seed stability, regression placement, bundle carry-forward).
- [x] **Component tests** for the `Button` CVA atom and the ROI simulator's
      live recalculation + reset (driving the real Zustand store).
- [x] **A11y pass** — `aria-pressed` on the chart vital-toggle and commit
      selector, `role="img"` + `aria-label` on treemap tiles and the chart,
      and `sr-only` data summaries so the treemap and line chart aren't
      purely visual.
- [x] **States** — route-level `errorElement` (`ErrorPage`) for thrown/loader
      errors, and an explicit "commit not found" notice on the deep-dive when
      an unknown hash is requested. (Alert center & recommendations already had
      empty states.)

> Remaining a11y follow-ups: full color-contrast audit on the soft-tone
> badges, and a loading skeleton for the lazy routes (currently a text
> fallback).

### 1. Make the simulation feel real

Right now data is generated client-side. The product story is "audits every
commit in CI" — close that gap.

- [x] **Pluggable data source** ✅ — a `CommitSource` interface (`src/data/source.ts`)
      now sits between the app and its data; the whole dashboard reads through it
      and the active source is swappable in one place. Provenance is surfaced in
      the sidebar.
- [x] **CI gate** ✅ — `scripts/vitals-gate.mjs` scores a vitals report against
      the Web Vitals thresholds and exits non-zero on a poor metric; a GitHub
      Action (`.github/workflows/ci.yml`) runs lint → test → build → gate. A test
      asserts the gate's thresholds stay in sync with the app's.
- [ ] **Ingest real measurements** — implement a `CommitSource` that reads
      Lighthouse CI / `web-vitals` JSON artifacts or pulls CrUX field data
      (needs external credentials/CI artifacts; the seam is ready for it).

### 2. Deep-dive depth ✅ done

- [x] **Commit comparison** ✅ — a `/compare` page diffs any two commits side by
      side: per-vital deltas with both ratings, and a bundle module diff
      (added/removed/changed with size deltas). Pure `compareCommits` is
      unit-tested.
- [x] **Recommendation provenance** ✅ — each recommendation links to the
      authoritative web.dev guidance it draws on.
- [x] **Bundle drill-down** ✅ — treemap tiles are selectable; choosing one
      reveals what imports it (`importedBy`) and why it weighs what it does.
- [x] **Lightweight diff view** ✅ — files carrying the regression's signal
      expand to a colored, authored hunk preview — a scoped stand-in for a full
      diff engine.

### 3. Business-impact model ✅ done

- [x] **Price layout shift (CLS)** ✅ — the model now has two independent,
      summed conversion channels (latency + layout shift), each with its own
      adjustable assumption slider. All three regressions carry a number; the
      simulator shows a per-channel breakdown. Pure model covered by tests.
- [x] **Scenario presets ("what if we fix it")** ✅ — recommendations carry
      structured `recovery` gains; toggling fixes on the deep-dive recomputes the
      residual impact and the recovered $/mo live against the shared assumptions.
      `applyRecoveries` is pure and unit-tested.
- [x] **Sensitivity view** ✅ — the ROI page sweeps the driving assumption across
      its full range and plots the loss curve, with a marker at the current
      value. Presents the heuristic as a model with uncertainty, not a point fact.
- [x] **Shareable report** ✅ — an "Export PDF" button renders a print-optimized
      `RoiReport` (projection + assumptions + scenario + methodology) via the
      browser's own Save-as-PDF. Zero dependencies: `@media print` strips the app
      chrome and forces a light, ink-saving palette.

### 4. Polish (nice-to-have)

- [x] **Sparklines** on the metric cards ✅ — dependency-free SVG `Sparkline`
      atom showing each vital's recent trend, colored by health.
- [x] **Commit search / filter** ✅ — the deep-dive selector filters by hash,
      message, or author.
- [x] **Theme** ✅ — dark/light toggle (persisted, no flash) driven entirely by
      scoped CSS-token overrides, so utilities, Recharts colors, and badges all
      re-theme from one place. Active source/theme shown in the sidebar.
- [x] **Responsive / mobile** ✅ — the sidebar collapses into a slide-in drawer
      with a top bar below `md`; content grids already stack.
- [ ] **Framer Motion** — chart-point and page transitions (deferred in v1).

---

## Notes / known limitations

- Data is deterministic and in-memory; there is no persistence beyond the ROI
  assumptions (`localStorage`).
- The ROI model prices two channels — latency (LCP + INP) and layout shift
  (CLS) — each as an adjustable assumption.
- The only roadmap items left are external-dependency or explicitly-deferred:
  live Lighthouse/CrUX ingestion (§1, needs credentials; the `CommitSource` seam
  is ready) and Framer Motion transitions (§4, cut from v1 per the brief).
- `react-router` uses `createBrowserRouter`; deploying under a sub-path needs a
  `basename` and an SPA-fallback rewrite on the host.
