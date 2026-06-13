import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/templates/PageHeader'
import { MetricsGrid } from '@/components/organisms/MetricsGrid'
import { CommitStreamChart } from '@/components/organisms/CommitStreamChart'
import { AlertCenter } from '@/components/organisms/AlertCenter'
import { ALERTS, COMMITS, HEAD_COMMIT, PREV_COMMIT } from '@/data/dataset'
import { formatShortDate } from '@/lib/format'

export const TimelinePage = () => {
  const navigate = useNavigate()
  const openCommit = (hash: string) => navigate(`/commits/${hash}`)

  return (
    <>
      <PageHeader
        eyebrow="Global performance timeline"
        title="Application health"
        description={`Core Web Vitals across the last ${COMMITS.length} simulated deployments. Current production is HEAD ${HEAD_COMMIT.hash}, deployed ${formatShortDate(HEAD_COMMIT.date)}.`}
      />

      <section className="mb-6">
        <MetricsGrid
          current={HEAD_COMMIT}
          previous={PREV_COMMIT}
          history={COMMITS}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <CommitStreamChart commits={COMMITS} onSelectCommit={openCommit} />
        <AlertCenter alerts={ALERTS} onSelect={openCommit} />
      </section>
    </>
  )
}
