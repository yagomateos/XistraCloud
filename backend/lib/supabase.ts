import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co'
// IMPORTANT: This should be the SERVICE_ROLE_KEY, not the anon key.
// I will ask the user for it.
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxMzAxOSwiZXhwIjoyMDcyOTg5MDE5fQ.oLmAm48uUpwKjH_LhJtNaNrvo5nE9cEkAyfjQtkwCKg'

export const supabase = createClient(supabaseUrl, supabaseKey)
