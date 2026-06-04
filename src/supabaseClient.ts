import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaced clearly in the UI via App.tsx so setup mistakes are obvious.
  console.warn(
    'Missing Supabase env vars. Copy .env.example to .env.local and fill in your project URL + anon key.',
  )
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// createClient() throws on an empty URL, which would crash the app before the
// "configure Supabase" screen can render. Fall back to a harmless placeholder
// when env vars are missing — isSupabaseConfigured guards against ever using it.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
