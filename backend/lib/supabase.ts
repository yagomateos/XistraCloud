import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://metzjfocvkelucinstul.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || '***REMOVED-SUPABASE-ANON-KEY***'

// Service role key para operaciones del backend (bypassa RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '***REMOVED-SUPABASE-SERVICE-KEY***'

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
