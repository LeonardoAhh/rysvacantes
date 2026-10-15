import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim()

function createBrowserClient() {
  if (!url || !key) return null

  try {
    const parsedUrl = new URL(url)
    if (!["http:", "https:"].includes(parsedUrl.protocol)) return null
    return createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  } catch {
    return null
  }
}

export const supabase = createBrowserClient()
