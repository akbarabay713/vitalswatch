import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_ASSUMPTIONS, type RoiAssumptions } from '@/lib/roi'

interface RoiState {
  assumptions: RoiAssumptions
  scenarioHash: string | null
  setAssumption: <K extends keyof RoiAssumptions>(
    key: K,
    value: RoiAssumptions[K],
  ) => void
  setScenario: (hash: string) => void
  reset: () => void
}

export const useRoiStore = create<RoiState>()(
  persist(
    (set) => ({
      assumptions: DEFAULT_ASSUMPTIONS,
      scenarioHash: null,
      setAssumption: (key, value) =>
        set((state) => ({
          assumptions: { ...state.assumptions, [key]: value },
        })),
      setScenario: (hash) => set({ scenarioHash: hash }),
      reset: () => set({ assumptions: DEFAULT_ASSUMPTIONS }),
    }),
    {
      name: 'vitalswatch-roi',
      version: 2,
      // merge new defaults so an older persisted model doesn't leave fields undefined
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<RoiState>
        return {
          ...state,
          assumptions: { ...DEFAULT_ASSUMPTIONS, ...state.assumptions },
        } as RoiState
      },
    },
  ),
)
