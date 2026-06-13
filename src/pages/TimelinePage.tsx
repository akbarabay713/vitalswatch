import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/templates/PageHeader'
import { MetricsGrid } from '@/components/organisms/MetricsGrid'
import { CommitStreamChart } from '@/components/organisms/CommitStreamChart'
import { AlertCenter } from '@/components/organisms/AlertCenter'
import { useDataset } from '@/data/dataset'
import { formatShortDate } from '@/lib/format'

export const TimelinePage = () => {
  const navigate = useNavigate()
  const { commits, head, prev, alerts } = useDataset()
  const openCommit = (hash: string) => navigate(`/commits/${hash}`)

  return (
    <>
      <PageHeader
        eyebrow="Global performance timeline"
        title="Application health"
        description={
          head
            ? `Core Web Vitals across the last ${commits.length} deployments. Current production is HEAD ${head.hash}, deployed ${formatShortDate(head.date)}.`
            : 'No commit data loaded.'
        }
      />

      {head && prev && (
        <section className="mb-6">
          <MetricsGrid current={head} previous={prev} history={commits} />
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <CommitStreamChart commits={commits} onSelectCommit={openCommit} />
        <AlertCenter alerts={alerts} onSelect={openCommit} />
      </section>
    </>
  )
}
