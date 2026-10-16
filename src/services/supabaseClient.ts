import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('أضف رابط Supabase ومفتاح anon إلى إعدادات البيئة قبل البحث.')
  }

  return createClient<Database>(url, anonKey)
}
