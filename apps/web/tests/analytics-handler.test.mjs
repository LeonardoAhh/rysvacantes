import { test } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { collectActivity } from "../server/analytics-handler.ts"
import { parsePublicActivity } from "../src/features/site-analytics/activity-contract.ts"
import { getBusinessDate } from "../src/lib/business-date.ts"

const config = {
  environment: "production",
  origin: "https://www.vinoplasticrys.lat",
  url: "https://example.supabase.co",
  key: "server-test-key",
  hashSecret: "x".repeat(64),
}
const body = () => ({
  kind: "view",
  path: "/",
  visitorId: randomUUID(),
  requestId: randomUUID(),
})
const request = () => ({
  method: "POST",
  headers: {
    origin: config.origin,
    "content-type": "application/json",
    "x-vercel-forwarded-for": "192.0.2.10",
  },
  body: body(),
})

test("collector validates origin, method, content type, payload and trusted address before ingestion", async () => {
  let calls = 0
  const ingest = async () => {
    calls++
    return { data: { accepted: true }, error: null }
  }
  for (const [change, status] of [
    [{ method: "GET" }, 405],
    [
      { headers: { ...request().headers, origin: "https://other.example" } },
      403,
    ],
    [{ headers: { ...request().headers, "content-type": "text/plain" } }, 415],
    [{ headers: { ...request().headers, "content-length": "3000" } }, 413],
    [
      {
        headers: {
          ...request().headers,
          "x-vercel-forwarded-for": undefined,
          "x-forwarded-for": "192.0.2.10",
        },
      },
      400,
    ],
    [{ body: { ...body(), phone: "forbidden" } }, 400],
    [{ body: { ...body(), path: "/dashboard" } }, 400],
    [{ body: "invalid json" }, 400],
  ])
    assert.equal(
      (await collectActivity({ ...request(), ...change }, config, ingest))
        .status,
      status
    )
  assert.equal(calls, 0)
  assert.equal(
    (
      await collectActivity(
        request(),
        { ...config, hashSecret: undefined },
        ingest
      )
    ).status,
    503
  )
  assert.equal(
    (
      await collectActivity(
        request(),
        { ...config, environment: "preview" },
        ingest
      )
    ).status,
    204
  )
  assert.equal(calls, 0)
})

test("collector sends HMAC pseudonym instead of raw IP, and surfaces rate limits and database errors", async () => {
  let captured
  const valid = await collectActivity(request(), config, async (args) => {
    captured = args
    return { data: { accepted: true }, error: null }
  })
  assert.equal(valid.status, 204)
  assert.match(captured.p_client_hash, /^[a-f0-9]{64}$/)
  assert.ok(!JSON.stringify(captured).includes("192.0.2.10"))
  for (const [data, error, status] of [
    [{ accepted: false, reason: "rate_limited" }, null, 429],
    [{ accepted: false, reason: "request_conflict" }, null, 409],
    [null, { code: "42501" }, 503],
  ]) {
    assert.equal(
      (await collectActivity(request(), config, async () => ({ data, error })))
        .status,
      status
    )
  }
  assert.equal(
    (
      await collectActivity(request(), config, async () => {
        throw Error("offline")
      })
    ).status,
    503
  )
})

test("activity contract excludes PII and binds events to their allowed routes", () => {
  assert.ok(parsePublicActivity(body()))
  for (const invalid of [
    { ...body(), vacancyId: "forbidden" },
    { ...body(), visitorId: "invalid" },
    { ...body(), kind: "event", event: "vacancy_detail" },
    { ...body(), kind: "event", event: "home_vacancies", path: "/about" },
    { ...body(), event: "whatsapp_click" },
  ])
    assert.equal(parsePublicActivity(invalid), null)
})

test("expiry uses Mexico business date rather than UTC or visitor timezone", () => {
  assert.equal(getBusinessDate(new Date("2026-10-20T03:00:00Z")), "2026-10-19")
  assert.equal(getBusinessDate(new Date("2026-10-20T06:00:00Z")), "2026-10-20")
})
