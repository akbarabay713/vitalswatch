# Project brief: VitalsWatch

**The automated web vitals regression tracker & business impact dashboard**

---

## Core mission

VitalsWatch is a developer-tooling dashboard that monitors a web application's performance across consecutive deployments. It simulates a CI/CD pipeline environment where every commit is audited for Core Web Vitals (LCP, INP, CLS). It visualizes performance trends, catches regressions before they reach production, identifies the file or dependency causing the issue, and translates technical lag into estimated business impact.

---

## App architecture: 3 pages

### 1. Global performance timeline (analytics dashboard)

The main view — what a tech lead checks to monitor application health over time.

- **Commit stream chart**: interactive line graph plotting performance history across the last 20 simulated commits
- **Metrics grid**: at-a-glance cards for current production health — LCP (visual load speed), INP (interaction responsiveness), CLS (layout stability)
- **Alert center**: highlights deployments that triggered a regression alert (e.g. "Commit 84f1a dropped LCP by 1.2s")

### 2. Commit deep-dive (developer tool)

Clicking a commit from the timeline isolates the problem.

- **Code change summary**: a simplified files-changed list with size deltas — not a full diff viewer (see scope notes)
- **Bundle analyzer map**: a tree-map breaking down JS bundle weight for that commit, highlighting newly added heavy dependencies (e.g. "added lodash without tree-shaking, +70kb")
- **Recommendations**: actionable tips generated from the commit's `regressionCause`, e.g. "defer loading hero-image.png — it's blocking LCP"

### 3. Business impact / ROI calculator (executive tool)

Ties technical metrics to financial outcomes.

- **Financial simulator**: sliders for monthly unique visitors, average conversion rate, average order value
- **Adjustable impact assumption**: rather than hardcoding "0.1s delay = 8% conversion drop" as fact, expose it as a slider — "conversion impact per 100ms of delay, based on industry research: [adjustable]". This treats the heuristic as a model input rather than gospel, which is more defensible and more impressive to anyone with a data/finance background.
- **Live calculation**: "current LCP regression is projected to cost $X/month in lost conversions," recalculating as sliders move

---

## Mock data engine

No backend required — a frontend simulation framework drives the whole app.

```typescript
interface CommitData {
  hash: string;
  author: string;
  date: string;
  message: string;
  vitals: { lcp: number; inp: number; cls: number };
  bundleDelta: { name: string; sizeKb: number; isNew: boolean }[];
  filesChanged: { path: string; additions: number; deletions: number }[];
  isRegression: boolean;
  regressionCause?: string; // human-readable, drives recommendations
}
```

- Generate 20 commits programmatically: a baseline-vitals function plus small random jitter for normal variation
- Hand-author 2-3 **regression commits** with deliberate, named causes (e.g. uncompressed 5MB image pushing LCP from 1.1s to 4.8s)
- The regression commits are the demo script — everything else exists to make those three look like meaningful anomalies in the trend

---

## Tech stack

- **Framework**: React + TypeScript
- **Charts**: Recharts (commit stream timeline)
- **Bundle visualization**: custom flexbox/grid tree-map
- **State management**: Zustand — needed for cross-page slider state (ROI assumptions affect what's shown on other pages)
- **Build tool**: Vite

---

## Build order / scope notes

This is a multi-week project as scoped. Build vertically, not horizontally:

1. Build the `CommitData` generator and regression-cause-to-recommendation mapping first — this is the backbone everything else reads from
2. Get **one** regression commit's full journey working end-to-end: timeline → deep-dive → ROI impact
3. Then expand to all 20 commits and all three pages

**Cut for v1**:

- Framer Motion — nice polish, but adds a dependency without proving engineering depth
- Full git diff viewer — a files-changed + size-delta list delivers most of the value for a fraction of the effort

**Keep for v1** (highest-value, most differentiating):

- The tree-map bundle analyzer
- The regression → recommendation mapping
- The adjustable ROI assumption slider

---

## Why this project works

VitalsWatch shifts the conversation from "look at my clean code" to "look at how I protect production environments and translate engineering work into business outcomes." It demonstrates:

- **Performance fluency**: Core Web Vitals, bundle optimization, rendering behavior
- **Product and business framing**: connecting frontend performance to revenue, not just code quality
- **Developer experience instincts**: building the kind of internal tool that makes a team faster and safer
