import { deriveAlerts } from './alerts'
import { commitSource } from './source'

export const COMMITS = commitSource.load()

export const HEAD_COMMIT = COMMITS[COMMITS.length - 1]

export const PREV_COMMIT = COMMITS[COMMITS.length - 2]

export const ALERTS = deriveAlerts(COMMITS)

export const getCommitByHash = (hash: string) =>
  COMMITS.find((c) => c.hash === hash)

export const getCommitIndex = (hash: string): number =>
  COMMITS.findIndex((c) => c.hash === hash)
