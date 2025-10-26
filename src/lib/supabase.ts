import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Ensure sessions are properly managed
    persistSession: true,
    // Use a custom storage key for better control
    storageKey:
      'sb-' + supabaseUrl.split('//')[1].split('.')[0] + '-auth-token',
    // Detect session from URL on page load
    detectSessionInUrl: true,
    // Auto refresh tokens
    autoRefreshToken: true,
  },
})
