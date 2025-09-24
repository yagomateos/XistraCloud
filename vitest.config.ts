/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    css: true,
    include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    exclude: ['backend/**', 'awesome-compose/**', 'src/pages/__tests__/**', 'src/**/__tests__/**'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
