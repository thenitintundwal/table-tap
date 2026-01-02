import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase: SupabaseClient<Database> = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
