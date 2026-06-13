import { Card, CardDescription, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Badge } from '@/components/atoms/Badge'
import { AlertItem } from '@/components/molecules/AlertItem'
import type { RegressionAlert } from '@/data/alerts'

interface AlertCenterProps {
  alerts: RegressionAlert[]
  onSelect?: (hash: string) => void
}

export const AlertCenter = ({ alerts, onSelect }: AlertCenterProps) => {
  return (
    <Card padding="lg" className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle>Alert center</CardTitle>
          <CardDescription>Deployments that tripped a threshold</CardDescription>
        </div>
        <Badge tone={alerts.length ? 'poor' : 'good'}>
          {alerts.length} active
        </Badge>
      </CardHeader>

      {alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <span className="text-2xl">✓</span>
          <p className="text-sm text-ink-muted">No regressions detected</p>
          <p className="text-xs text-ink-subtle">
            All commits are within Core Web Vitals thresholds.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto">
          {alerts.map((alert) => (
            <AlertItem key={alert.commitHash} alert={alert} onSelect={onSelect} />
          ))}
        </div>
      )}
    </Card>
  )
}
