import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co'
const supabaseAnonKey = '***REMOVED-SUPABASE-ANON-KEY***'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
