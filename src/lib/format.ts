const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyPreciseFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const compactFmt = new Intl.NumberFormat('en-US', { notation: 'compact' })

export const formatCurrency = (value: number, precise = false): string =>
  (precise ? currencyPreciseFmt : currencyFmt).format(value)

export const formatCompact = (value: number): string => compactFmt.format(value)

export const formatPercent = (value: number, fractionDigits = 1): string =>
  `${value.toFixed(fractionDigits)}%`

export const formatSeconds = (value: number): string => `${value.toFixed(2)}s`

export const formatMs = (value: number): string => `${Math.round(value)}ms`

export const formatSignedKb = (value: number): string => {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  return `${sign}${Math.abs(value).toFixed(0)}kb`
}

export const formatShortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
