// Test setup for backend
require('dotenv').config();

// Mock environment variables for testing
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key';

// Set test timeout
jest.setTimeout(10000);

// Mock console.log for cleaner test output
const originalLog = console.log;
global.mockConsoleLog = jest.fn();

beforeEach(() => {
  // console.log = mockConsoleLog;
});

afterEach(() => {
  console.log = originalLog;
  jest.clearAllMocks();
});
