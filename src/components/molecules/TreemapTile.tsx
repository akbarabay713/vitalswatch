import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import type { BundleModule } from '@/data/types'

const tileVariants = cva(
  'group relative flex flex-col justify-between overflow-hidden rounded-md border p-2 text-left transition-all',
  {
    variants: {
      category: {
        framework: 'border-brand/20 bg-brand-soft/60 text-brand',
        app: 'border-good/20 bg-good-soft/60 text-good',
        vendor: 'border-needs/20 bg-needs-soft/60 text-needs',
        assets: 'border-border-strong bg-overlay text-ink-muted',
      },
      isNew: {
        true: 'ring-2 ring-poor ring-offset-2 ring-offset-surface',
        false: '',
      },
      selected: {
        true: 'outline outline-2 outline-brand',
        false: '',
      },
    },
    defaultVariants: { category: 'vendor', isNew: false, selected: false },
  },
)

interface TreemapTileProps {
  module: BundleModule
  /** share of total bundle weight, 0–1 */
  share: number
  selected?: boolean
  onSelect?: (name: string) => void
}

export const TreemapTile = ({ module, share, selected, onSelect }: TreemapTileProps) => {
  const showLabel = share > 0.025
  const sizeLabel =
    module.sizeKb >= 1000
      ? `${(module.sizeKb / 1000).toFixed(1)}mb`
      : `${module.sizeKb}kb`

  return (
    <button
      type="button"
      onClick={() => onSelect?.(module.name)}
      aria-pressed={selected}
      aria-label={`${module.name}, ${sizeLabel}${module.isNew ? ', new this commit' : ''}. View dependency details.`}
      className={cn(
        tileVariants({ category: module.category, isNew: module.isNew, selected }),
      )}
      style={{ flexGrow: share, flexBasis: 0 }}
      title={`${module.name} — ${module.sizeKb}kb${module.isNew ? ' (new)' : ''}`}
    >
      {module.isNew && (
        <span className="absolute right-1 top-1 rounded bg-poor px-1 py-0.5 text-[9px] font-bold uppercase leading-none text-white">
          new
        </span>
      )}
      {showLabel && (
        <>
          <span className="truncate font-mono text-[11px] font-medium text-ink">
            {module.name}
          </span>
          <span className="font-mono text-[10px] tabular-nums opacity-80">
            {sizeLabel}
          </span>
        </>
      )}
    </button>
  )
}
