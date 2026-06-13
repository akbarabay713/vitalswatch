import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/templates/PageHeader'
import { buttonVariants } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { CommitHeader } from '@/components/organisms/CommitHeader'
import { CommitSelector } from '@/components/organisms/CommitSelector'
import { FilesChangedList } from '@/components/organisms/FilesChangedList'
import { BundleTreemap } from '@/components/organisms/BundleTreemap'
import { RecommendationsPanel } from '@/components/organisms/RecommendationsPanel'
import { ImpactCallout } from '@/components/organisms/ImpactCallout'
import { Link } from 'react-router-dom'
import { COMMITS, getCommitByHash } from '@/data/dataset'
import {
  commitScenario,
  regressionScenarios,
  commitAddedDelayMs,
  commitAddedCls,
} from '@/data/impact'

const severity = (hash: string): number => {
  const commit = getCommitByHash(hash)!
  return commitAddedDelayMs(commit) + commitAddedCls(commit) * 10_000
}

export const CommitDeepDivePage = () => {
  const { hash } = useParams<{ hash: string }>()
  const navigate = useNavigate()

  // with no hash, open on the highest-impact regression
  const fallback =
    [...regressionScenarios()].sort(
      (a, b) => severity(b.hash) - severity(a.hash),
    )[0] ?? COMMITS[COMMITS.length - 1]
  const matched = hash ? getCommitByHash(hash) : undefined
  const commit = matched || fallback
  const notFound = Boolean(hash) && !matched

  const select = (h: string) => navigate(`/commits/${h}`)

  return (
    <>
      <PageHeader
        eyebrow="Commit deep-dive"
        title="Isolate the regression"
        description="Trace a deployment's performance hit to the exact files, dependencies, and assets responsible — then to the fix."
        actions={
          <Link to="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            ← Back to timeline
          </Link>
        }
      />

      {notFound && (
        <div className="mb-4 rounded-lg border border-needs/30 bg-needs-soft/50 px-4 py-2.5 text-xs text-needs">
          Commit <code className="font-mono">{hash}</code> wasn&apos;t found —
          showing the highest-impact regression instead.
        </div>
      )}

      <CommitSelector
        commits={COMMITS}
        selectedHash={commit.hash}
        onSelect={select}
        searchable
      />

      <Card padding="lg" className="my-6">
        <CommitHeader commit={commit} />
      </Card>

      {commit.isRegression && (
        <div className="mb-6">
          <ImpactCallout scenario={commitScenario(commit)} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <BundleTreemap commit={commit} />
        <FilesChangedList commit={commit} />
      </div>

      <div className="mt-6">
        <RecommendationsPanel commit={commit} />
      </div>
    </>
  )
}
