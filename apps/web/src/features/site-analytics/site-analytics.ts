import { supabase } from "@/lib/supabase"
import { publicSiteRoutes } from "@/lib/routes"
import { siteOrigin } from "@/lib/seo"
import type { SiteEventName } from "./site-events"
import type { PublicActivity } from "./activity-contract"

export type SiteVisitPeriod = 7 | 30 | "all"

const visitorStorageKey = "vinoplastic:site-visitor:v1"
let fallbackVisitorId: string | null = null
const pageRequests = new WeakMap<object, string>()
let reportedFailure = false

async function submitActivity(activity: PublicActivity) {
  try {
    const response = await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity),
      keepalive: true,
      credentials: "omit",
    })
    if (!response.ok) throw new Error("analytics_unavailable")
  } catch {
    // Report once without payloads, visitor IDs or contact information.
    if (!reportedFailure)
      console.warn("El registro de estadísticas no está disponible.")
    reportedFailure = true
  }
}

function canRecord(path: string) {
  return (
    publicSiteRoutes.includes(path) &&
    window.location.origin === siteOrigin
  )
}

function getVisitorId() {
  if (!globalThis.crypto?.randomUUID) return null

  try {
    const stored = window.localStorage.getItem(visitorStorageKey)
    if (
      stored &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        stored
      )
    )
      return stored
    const id = crypto.randomUUID()
    window.localStorage.setItem(visitorStorageKey, id)
    return id
  } catch {
    fallbackVisitorId ??= crypto.randomUUID()
    return fallbackVisitorId
  }
}

export async function recordPublicPageView(path: string, navigation?: object) {
  if (!canRecord(path)) return

  const visitorId = getVisitorId()
  if (!visitorId) return

  let requestId = navigation ? pageRequests.get(navigation) : undefined
  if (!requestId) {
    requestId = crypto.randomUUID()
    if (navigation) pageRequests.set(navigation, requestId)
  }
  await submitActivity({ kind: "view", path, visitorId, requestId })
}

export async function recordPublicEvent(name: SiteEventName, path: string) {
  if (!canRecord(path)) return
  const visitorId = getVisitorId()
  if (!visitorId) return
  await submitActivity({
    kind: "event",
    event: name,
    path,
    visitorId,
    requestId: crypto.randomUUID(),
  })
}

export type SiteVisitSummary = {
  totalViews: number
  uniqueVisitors: number
  todayViews: number
  pages: { path: string; views: number; visitors: number }[]
  events: { name: SiteEventName; clicks: number; visitors: number }[]
  trend: {
    day: string
    views: number
    visitors: number
    interactions: number
  }[]
}

export async function getSiteVisitSummary(
  period: SiteVisitPeriod = "all"
): Promise<SiteVisitSummary> {
  if (!supabase) throw new Error("La conexión de visitas no está configurada.")

  const { data, error } = await supabase.rpc("site_engagement_summary", {
    p_days: period === "all" ? null : period,
  })
  if (error) {
    if (
      ["PGRST202", "42883", "42P01"].includes(error.code) ||
      (period === "all" && error.code === "22023")
    ) {
      throw new Error("Falta aplicar la migración de estadísticas en Supabase.")
    }
    throw new Error("No pudimos cargar las estadísticas. Inténtalo de nuevo.")
  }

  if (!data || !Array.isArray(data.trend)) {
    throw new Error("Falta aplicar la migración de estadísticas en Supabase.")
  }
  return data as SiteVisitSummary
}
