import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co'
// IMPORTANT: This should be the SERVICE_ROLE_KEY, not the anon key.
// I will ask the user for it.
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '***REMOVED-SUPABASE-SERVICE-KEY***'

export const supabase = createClient(supabaseUrl, supabaseKey)
