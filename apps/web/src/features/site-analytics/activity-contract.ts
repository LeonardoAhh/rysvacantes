import { publicSiteRoutes } from "../../lib/routes.ts"

export const activityEventNames = [
  "home_vacancies",
  "vacancy_detail",
  "contact_click",
  "transport_click",
  "whatsapp_click",
] as const
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export type PublicActivity = {
  kind: "view" | "event"
  path: string
  visitorId: string
  requestId: string
  event?: (typeof activityEventNames)[number]
}

export function parsePublicActivity(value: unknown): PublicActivity | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const item = value as Record<string, unknown>
  if (
    Object.keys(item).some(
      (key) =>
        !["kind", "path", "visitorId", "requestId", "event"].includes(key)
    )
  )
    return null
  if (
    (item.kind !== "view" && item.kind !== "event") ||
    typeof item.path !== "string" ||
    !publicSiteRoutes.includes(item.path) ||
    typeof item.visitorId !== "string" ||
    !uuid.test(item.visitorId) ||
    typeof item.requestId !== "string" ||
    !uuid.test(item.requestId)
  )
    return null
  if (item.kind === "view" && item.event !== undefined) return null
  if (
    item.kind === "event" &&
    !activityEventNames.includes(
      item.event as (typeof activityEventNames)[number]
    )
  )
    return null
  if (
    (item.event === "home_vacancies" && item.path !== "/") ||
    (item.event === "vacancy_detail" && item.path !== "/vacancies")
  )
    return null
  return item as PublicActivity
}
