import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://metzjfocvkelucinstul.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMwMTksImV4cCI6MjA3Mjk4OTAxOX0.tp_Sg0giBPkSRWU17nJMNbSrbyKSm30DzsQbORcN4ts'

// Service role key para operaciones del backend (bypassa RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxMzAxOSwiZXhwIjoyMDcyOTg5MDE5fQ.oLmAm48uUpwKjH_LhJtNaNrvo5nE9cEkAyfjQtkwCKg'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Cliente con service role para operaciones administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔧 Supabase configuration:')
console.log('  URL:', supabaseUrl)
console.log('  Anon Key:', supabaseKey.substring(0, 20) + '...')
console.log('  Service Key:', supabaseServiceKey.substring(0, 20) + '...')
