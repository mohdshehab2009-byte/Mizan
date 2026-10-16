import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

let supabaseClient: SupabaseClient<Database> | undefined

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('أضف رابط Supabase ومفتاح anon إلى إعدادات البيئة قبل البحث.')
  }

  supabaseClient = createClient<Database>(url, anonKey)
  return supabaseClient
}
