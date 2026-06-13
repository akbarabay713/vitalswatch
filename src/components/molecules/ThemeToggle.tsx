import { useThemeStore } from '@/store/useThemeStore'
import { cn } from '@/lib/cn'

interface ThemeToggleProps {
  className?: string
}

export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const options = [
    { value: 'dark' as const, label: 'Dark', icon: '☾' },
    { value: 'light' as const, label: 'Light', icon: '☀' },
  ]

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={cn(
        'flex gap-1 rounded-lg border border-border bg-canvas p-1',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          aria-pressed={theme === opt.value}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            theme === opt.value
              ? 'bg-overlay text-ink'
              : 'text-ink-subtle hover:text-ink-muted',
          )}
        >
          <span aria-hidden>{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}
