import type { ReactNode } from 'react'
import { Slider } from '@/components/atoms/Slider'

interface SliderControlProps {
  label: string
  displayValue: ReactNode
  value: number
  min: number
  max: number
  step?: number
  onValueChange: (value: number) => void
  hint?: ReactNode
}

export const SliderControl = ({
  label,
  displayValue,
  value,
  min,
  max,
  step,
  onValueChange,
  hint,
}: SliderControlProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-ink">{label}</label>
        <span className="font-mono text-sm font-semibold tabular-nums text-brand">
          {displayValue}
        </span>
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={onValueChange}
        aria-label={label}
      />
      {hint && (
        <p className="text-[11px] leading-relaxed text-ink-subtle">{hint}</p>
      )}
    </div>
  )
}
