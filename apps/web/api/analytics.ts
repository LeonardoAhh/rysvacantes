import type { IncomingMessage, ServerResponse } from "node:http"
import { collectActivity } from "../server/analytics-handler.ts"
import { siteOrigin } from "../src/lib/seo.ts"

export default async function handler(
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse
) {
  const result = await collectActivity(request, {
    environment: process.env.VERCEL_ENV,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SECRET_KEY,
    hashSecret: process.env.ANALYTICS_HASH_SECRET,
    origin: siteOrigin,
  })
  response.setHeader("Cache-Control", "no-store")
  response.setHeader("X-Content-Type-Options", "nosniff")
  if (result.status === 405) response.setHeader("Allow", "POST")
  if (result.status === 429) response.setHeader("Retry-After", "60")
  if (result.status >= 500)
    console.error("Analytics collector unavailable", { code: result.code })
  response.statusCode = result.status
  if (result.status === 204) response.end()
  else {
    response.setHeader("Content-Type", "application/json")
    response.end(JSON.stringify({ error: result.code }))
  }
}
