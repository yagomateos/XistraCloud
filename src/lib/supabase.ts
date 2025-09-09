import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMwMTksImV4cCI6MjA3Mjk4OTAxOX0.tp_Sg0giBPkSRWU17nJMNbSrbyKSm30DzsQbORcN4ts'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
