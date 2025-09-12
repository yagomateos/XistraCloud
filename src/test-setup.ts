import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

// Mock environment variables
Object.defineProperty(process.env, 'VITE_API_URL', {
  value: 'http://localhost:3001',
  writable: true
})

Object.defineProperty(process.env, 'VITE_USE_MOCK_DATA', {
  value: 'false',
  writable: true
})

// Mock fetch globally
global.fetch = vi.fn()

// Setup console.error to fail tests on React warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      throw new Error(`Console error: ${args.join(' ')}`)
    }
    originalError(...args)
  }
})

afterAll(() => {
  console.error = originalError
})
