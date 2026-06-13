import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    // Default to node (fast, no DOM); component tests opt into jsdom per-file
    // via a `// @vitest-environment jsdom` pragma.
    environment: 'node',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
    // Run files sequentially — the suite is small and fast, and this avoids an
    // intermittent worker-pool startup race on Windows that flaked the whole run.
    fileParallelism: false,
  },
})
