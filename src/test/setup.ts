import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees between tests — only meaningful in a DOM environment, so
// node-environment (pure-logic) test files skip it.
afterEach(() => {
  if (typeof document !== 'undefined') cleanup()
})
