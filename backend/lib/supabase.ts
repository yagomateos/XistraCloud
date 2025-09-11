import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://dlxgauxhgzgsbsqmlqfi.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRseGdhdXhoZ3pnc2JzcW1scWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5NzY0MzksImV4cCI6MjA0MTU1MjQzOX0.XLSz_rUbYi1dHGl3XLFGjl_fQVcShXQK0wnJVpqv2fI'

export const supabase = createClient(supabaseUrl, supabaseKey)
