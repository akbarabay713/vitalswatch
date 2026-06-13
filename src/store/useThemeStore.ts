import { create } from 'zustand'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'vitalswatch-theme'

const hasDom = (): boolean =>
  typeof document !== 'undefined' && typeof localStorage !== 'undefined'

const readInitial = (): Theme => {
  if (!hasDom()) return 'dark'
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'light' || saved === 'dark' ? saved : 'dark'
}

const applyTheme = (theme: Theme): void => {
  if (hasDom()) document.documentElement.dataset.theme = theme
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: readInitial(),
  setTheme: (theme) => {
    if (hasDom()) localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
  toggle: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
}))

// apply before first paint to avoid a flash of the wrong theme
applyTheme(useThemeStore.getState().theme)
