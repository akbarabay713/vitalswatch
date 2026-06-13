#!/usr/bin/env node
// CI Core Web Vitals gate. Reads a { lcp, inp, cls } report and exits non-zero
// when any metric is poor.  Usage: node scripts/vitals-gate.mjs [report.json]
// Thresholds mirror src/data/thresholds.ts (kept in sync by a test).
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

export const THRESHOLDS = {
  lcp: { good: 2.5, needs: 4.0 },
  inp: { good: 200, needs: 500 },
  cls: { good: 0.1, needs: 0.25 },
}

export const VITAL_KEYS = ['lcp', 'inp', 'cls']

export const rate = (key, value) => {
  const t = THRESHOLDS[key]
  if (value <= t.good) return 'good'
  if (value <= t.needs) return 'needs-improvement'
  return 'poor'
}

export const evaluateVitals = (vitals) => {
  const results = VITAL_KEYS.map((key) => ({
    key,
    value: vitals[key],
    rating: rate(key, vitals[key]),
  }))
  const failures = results.filter((r) => r.rating === 'poor')
  const warnings = results.filter((r) => r.rating === 'needs-improvement')
  return { results, failures, warnings, pass: failures.length === 0 }
}

const ICON = { good: '✓', 'needs-improvement': '!', poor: '✗' }
const UNIT = { lcp: 's', inp: 'ms', cls: '' }

const formatReport = ({ results, pass }) => {
  const lines = results.map(
    (r) =>
      `  ${ICON[r.rating]} ${r.key.toUpperCase().padEnd(3)} ${String(r.value).padStart(6)}${UNIT[r.key]}  ${r.rating}`,
  )
  return [
    'VitalsWatch — Core Web Vitals gate',
    ...lines,
    '',
    pass ? '✓ PASS — all vitals within thresholds' : '✗ FAIL — a vital regressed into the poor band',
  ].join('\n')
}

const main = async () => {
  const path = process.argv[2] ?? 'scripts/vitals.sample.json'
  let vitals
  try {
    vitals = JSON.parse(await readFile(path, 'utf8'))
  } catch (err) {
    console.error(`vitals-gate: could not read report at "${path}": ${err.message}`)
    process.exit(2)
  }
  const missing = VITAL_KEYS.filter((k) => typeof vitals[k] !== 'number')
  if (missing.length) {
    console.error(`vitals-gate: report is missing numeric fields: ${missing.join(', ')}`)
    process.exit(2)
  }

  const evaluation = evaluateVitals(vitals)
  console.log(formatReport(evaluation))
  process.exit(evaluation.pass ? 0 : 1)
}

// run the CLI only when executed directly, not when imported by tests
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
