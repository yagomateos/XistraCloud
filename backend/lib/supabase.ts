import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://dlxgauxhgzgsbsqmlqfi.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || '***REMOVED-SUPABASE-ANON-KEY-2***'

export const supabase = createClient(supabaseUrl, supabaseKey)
