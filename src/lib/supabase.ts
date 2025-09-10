import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://metzjfocvkelucinstul.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldHpqZm9jdmtlbHVjaW5zdHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTMwMTksImV4cCI6MjA3Mjk4OTAxOX0.tp_Sg0giBPkSRWU17nJMNbSrbyKSm30DzsQbORcN4ts'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan_type: 'free' | 'pro' | 'enterprise'
          organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          organization_id?: string | null
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          organization_id?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan_type: 'free' | 'pro' | 'enterprise'
          billing_email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          slug: string
          plan_type?: 'free' | 'pro' | 'enterprise'
          billing_email: string
        }
        Update: {
          name?: string
          slug?: string
          plan_type?: 'free' | 'pro' | 'enterprise'
          billing_email?: string
        }
      }
    }
  }
}
