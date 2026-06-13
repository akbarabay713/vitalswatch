import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: number
  min: number
  max: number
  step?: number
  onValueChange: (value: number) => void
}

// fill is an inline gradient (dynamic %); the thumb is styled via .vw-slider in index.css
export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, min, max, step = 1, onValueChange, ...props }, ref) => {
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className={cn('vw-slider w-full', className)}
        style={{
          background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${pct}%, var(--color-overlay) ${pct}%, var(--color-overlay) 100%)`,
        }}
        {...props}
      />
    )
  },
)
Slider.displayName = 'Slider'
