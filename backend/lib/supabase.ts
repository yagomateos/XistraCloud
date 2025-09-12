import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://metzjfocvkelucinstul.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || '***REMOVED-SUPABASE-ANON-KEY***'

export const supabase = createClient(supabaseUrl, supabaseKey)
