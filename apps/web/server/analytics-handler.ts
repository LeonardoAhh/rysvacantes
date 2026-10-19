import { createHmac } from "node:crypto"
import { isIP } from "node:net"
import { createClient } from "@supabase/supabase-js"
import { parsePublicActivity } from "../src/features/site-analytics/activity-contract.ts"

type CollectorResult = { accepted: boolean; reason?: string }
export type CollectorConfig = {
  environment: string | undefined
  url?: string
  key?: string
  hashSecret?: string
  origin: string
}
export type CollectorInput = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}
export type CollectorResponse = { status: number; code?: string }
type Ingest = (
  args: Record<string, string | null>
) => Promise<{ data: CollectorResult | null; error: unknown }>

export async function collectActivity(
  input: CollectorInput,
  config: CollectorConfig,
  ingest?: Ingest
): Promise<CollectorResponse> {
  if (input.method !== "POST")
    return { status: 405, code: "method_not_allowed" }
  // Preview and development deployments never send data to the production database.
  if (config.environment !== "production") return { status: 204 }
  if (input.headers.origin !== config.origin)
    return { status: 403, code: "origin_not_allowed" }
  if (
    typeof input.headers["content-type"] !== "string" ||
    !input.headers["content-type"].startsWith("application/json")
  )
    return { status: 415, code: "json_required" }
  if (Number(input.headers["content-length"] ?? 0) > 2048)
    return { status: 413, code: "request_too_large" }
  let body = input.body
  if (typeof body === "string") {
    if (Buffer.byteLength(body) > 2048)
      return { status: 413, code: "request_too_large" }
    try {
      body = JSON.parse(body)
    } catch {
      return { status: 400, code: "invalid_request" }
    }
  }
  const activity = parsePublicActivity(body)
  if (!activity) return { status: 400, code: "invalid_request" }
  // Only trust the header Vercel replaces at its edge, never a body-supplied IP.
  const address = input.headers["x-vercel-forwarded-for"]
  if (typeof address !== "string" || !isIP(address.trim()))
    return { status: 400, code: "client_address_unavailable" }
  if (
    !config.hashSecret ||
    config.hashSecret.length < 32 ||
    !config.url ||
    !config.key
  )
    return { status: 503, code: "collector_not_configured" }
  const day = new Date().toISOString().slice(0, 10)
  const clientHash = createHmac("sha256", config.hashSecret)
    .update(`${day}:${address.trim()}`)
    .digest("hex")
  try {
    const submit: Ingest =
      ingest ??
      (async (args) => {
        const client = createClient(config.url!, config.key!, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        })
        const { data, error } = await client.rpc("ingest_site_activity", args)
        return { data: data as CollectorResult | null, error }
      })
    const { data, error } = await submit({
      p_kind: activity.kind,
      p_path: activity.path,
      p_event: activity.event ?? null,
      p_visitor_id: activity.visitorId,
      p_request_id: activity.requestId,
      p_client_hash: clientHash,
    })
    if (error || !data) return { status: 503, code: "collector_unavailable" }
    if (!data.accepted)
      return {
        status: data.reason === "rate_limited" ? 429 : 409,
        code:
          data.reason === "rate_limited" ? "rate_limited" : "request_conflict",
      }
    return { status: 204 }
  } catch {
    return { status: 503, code: "collector_unavailable" }
  }
}
