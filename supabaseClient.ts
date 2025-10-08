import { createClient } from '@supabase/supabase-js'

// @ts-ignore: allow import.meta in build environments (set "module" in tsconfig to "es2020" or "esnext" to avoid this)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
// @ts-ignore: allow import.meta in build environments (set "module" in tsconfig to "es2020" or "esnext" to avoid this)
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
