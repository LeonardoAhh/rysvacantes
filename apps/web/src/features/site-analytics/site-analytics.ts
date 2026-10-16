import { supabase } from "@/lib/supabase"
import { publicSiteRoutes } from "@/lib/routes"
const visitorStorageKey = "vinoplastic:site-visitor:v1"
let fallbackVisitorId: string | null = null

function getVisitorId() {
  if (!globalThis.crypto?.randomUUID) return null

  try {
    const stored = window.localStorage.getItem(visitorStorageKey)
    if (
      stored &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored)
    ) return stored
    const id = crypto.randomUUID()
    window.localStorage.setItem(visitorStorageKey, id)
    return id
  } catch {
    fallbackVisitorId ??= crypto.randomUUID()
    return fallbackVisitorId
  }
}

export async function recordPublicPageView(path: string) {
  if (
    !supabase ||
    !publicSiteRoutes.includes(path) ||
    ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)
  ) return

  const visitorId = getVisitorId()
  if (!visitorId) return

  await supabase.rpc("record_site_view", {
    p_path: path,
    p_visitor_id: visitorId,
  })
}

export type SiteVisitSummary = {
  totalViews: number
  uniqueVisitors: number
  todayViews: number
  pages: { path: string; views: number; visitors: number }[]
}

export async function getSiteVisitSummary(): Promise<SiteVisitSummary> {
  if (!supabase) throw new Error("La conexión de visitas no está configurada.")

  const { data, error } = await supabase.rpc("site_visit_summary")
  if (error) {
    if (["PGRST202", "42883", "42P01"].includes(error.code)) {
      throw new Error("Falta aplicar la migración de estadísticas en Supabase.")
    }
    throw new Error("No pudimos cargar las estadísticas. Inténtalo de nuevo.")
  }

  return data as SiteVisitSummary
}
