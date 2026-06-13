import { useState } from 'react'
import { PageHeader } from '@/components/templates/PageHeader'
import { CommitSelector } from '@/components/organisms/CommitSelector'
import { CommitCompare } from '@/components/organisms/CommitCompare'
import { useDataset } from '@/data/dataset'
import { commitAddedCls, commitAddedDelayMs, regressionScenarios } from '@/data/impact'

export const ComparePage = () => {
  const { commits, getCommitByHash, getCommitIndex } = useDataset()

  const defaultPair = (): [string, string] => {
    const scenarios = regressionScenarios()
    const worst = [...scenarios].sort(
      (x, y) =>
        commitAddedDelayMs(y) + commitAddedCls(y) * 10_000 -
        (commitAddedDelayMs(x) + commitAddedCls(x) * 10_000),
    )[0]
    const idx = worst ? getCommitIndex(worst.hash) : commits.length - 1
    const before = commits[Math.max(0, idx - 1)]
    const after = worst ?? commits[commits.length - 1]
    return [before?.hash ?? '', after?.hash ?? '']
  }

  const [[aHash, bHash], setPair] = useState<[string, string]>(defaultPair)

  const a = getCommitByHash(aHash) ?? commits[0]
  const b = getCommitByHash(bHash) ?? commits[commits.length - 1]

  if (!a || !b) return null

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
            commits={commits}
            selectedHash={aHash}
            onSelect={(h) => setPair([h, bHash])}
          />
        </div>
        <div>
          <div className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-subtle">
            After (B)
          </div>
          <CommitSelector
            commits={commits}
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
