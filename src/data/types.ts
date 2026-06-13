export type VitalKey = 'lcp' | 'inp' | 'cls'

export interface Vitals {
  /** seconds */
  lcp: number
  /** milliseconds */
  inp: number
  cls: number
}

export type VitalRating = 'good' | 'needs-improvement' | 'poor'

export interface BundleModule {
  name: string
  sizeKb: number
  isNew: boolean
  category: 'framework' | 'app' | 'vendor' | 'assets'
  importedBy?: string[]
  note?: string
}

export interface BundleDelta {
  name: string
  sizeKb: number
  isNew: boolean
}

export interface FileChange {
  path: string
  additions: number
  deletions: number
  hunk?: string
}

export type RegressionType =
  | 'uncompressed-image'
  | 'unoptimized-dependency'
  | 'layout-shift'
  | 'render-blocking'
  | 'main-thread-block'

export interface CommitData {
  hash: string
  author: string
  date: string
  message: string
  vitals: Vitals
  bundleDelta: BundleDelta[]
  bundle: BundleModule[]
  filesChanged: FileChange[]
  isRegression: boolean
  regressionCause?: string
  regressionType?: RegressionType
}
