import { useState } from 'react'
import { PageHeader } from '@/components/templates/PageHeader'
import { CommitSelector } from '@/components/organisms/CommitSelector'
import { CommitCompare } from '@/components/organisms/CommitCompare'
import { COMMITS, getCommitByHash } from '@/data/dataset'
import { commitAddedCls, commitAddedDelayMs, regressionScenarios } from '@/data/impact'

// "after" = worst regression, "before" = the commit just before it
const defaultPair = (): [string, string] => {
  const worst = [...regressionScenarios()].sort(
    (x, y) =>
      commitAddedDelayMs(y) +
      commitAddedCls(y) * 10_000 -
      (commitAddedDelayMs(x) + commitAddedCls(x) * 10_000),
  )[0]
  const idx = worst ? COMMITS.findIndex((c) => c.hash === worst.hash) : COMMITS.length - 1
  const before = COMMITS[Math.max(0, idx - 1)]
  const after = worst ?? COMMITS[COMMITS.length - 1]
  return [before.hash, after.hash]
}

export const ComparePage = () => {
  const [[aHash, bHash], setPair] = useState<[string, string]>(defaultPair)

  const a = getCommitByHash(aHash) ?? COMMITS[0]
  const b = getCommitByHash(bHash) ?? COMMITS[COMMITS.length - 1]

  return (
    <>
      <PageHeader
        eyebrow="Commit comparison"
        title="Compare deployments"
        description="Diff any two commits side by side — see exactly which vitals moved and which modules entered the bundle between them."
      />

      <div className="space-y-4">
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
            Before (A)
          </div>
          <CommitSelector
            commits={COMMITS}
            selectedHash={aHash}
            onSelect={(h) => setPair([h, bHash])}
          />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
            After (B)
          </div>
          <CommitSelector
            commits={COMMITS}
            selectedHash={bHash}
            onSelect={(h) => setPair([aHash, h])}
          />
        </div>
      </div>

      <div className="mt-6">
        <CommitCompare a={a} b={b} />
      </div>
    </>
  )
}
