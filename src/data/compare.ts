import { rateVital, VITAL_ORDER } from './thresholds'
import { totalBundleKb } from './generateCommits'
import type { CommitData, VitalKey, VitalRating } from './types'

export interface VitalDelta {
  vital: VitalKey
  a: number
  b: number
  delta: number
  ratingA: VitalRating
  ratingB: VitalRating
}

export type ModuleStatus = 'added' | 'removed' | 'changed'

export interface ModuleDelta {
  name: string
  sizeA: number
  sizeB: number
  deltaKb: number
  status: ModuleStatus
}

export interface CommitComparison {
  vitals: VitalDelta[]
  bundleTotalA: number
  bundleTotalB: number
  bundleDeltaKb: number
  modules: ModuleDelta[]
  filesA: number
  filesB: number
}

export const compareCommits = (a: CommitData, b: CommitData): CommitComparison => {
  const vitals: VitalDelta[] = VITAL_ORDER.map((vital) => ({
    vital,
    a: a.vitals[vital],
    b: b.vitals[vital],
    delta: Number((b.vitals[vital] - a.vitals[vital]).toFixed(3)),
    ratingA: rateVital(vital, a.vitals[vital]),
    ratingB: rateVital(vital, b.vitals[vital]),
  }))

  const aMap = new Map(a.bundle.map((m) => [m.name, m.sizeKb]))
  const bMap = new Map(b.bundle.map((m) => [m.name, m.sizeKb]))
  const names = new Set([...aMap.keys(), ...bMap.keys()])

  const modules: ModuleDelta[] = []
  for (const name of names) {
    const sizeA = aMap.get(name) ?? 0
    const sizeB = bMap.get(name) ?? 0
    if (sizeA === sizeB) continue
    const status: ModuleStatus = !aMap.has(name)
      ? 'added'
      : !bMap.has(name)
        ? 'removed'
        : 'changed'
    modules.push({ name, sizeA, sizeB, deltaKb: sizeB - sizeA, status })
  }
  modules.sort((m, n) => Math.abs(n.deltaKb) - Math.abs(m.deltaKb))

  const bundleTotalA = totalBundleKb(a)
  const bundleTotalB = totalBundleKb(b)

  return {
    vitals,
    bundleTotalA,
    bundleTotalB,
    bundleDeltaKb: bundleTotalB - bundleTotalA,
    modules,
    filesA: a.filesChanged.length,
    filesB: b.filesChanged.length,
  }
}
