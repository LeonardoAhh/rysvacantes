import { test } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { assertPublicEnv } from "../server/assert-public-env.ts"
import { sourceLoader } from "./source-loader.mjs"

test("vacancy form catches invalid salary, missing shift/period and invalid dates before submission", () => {
  const { validateVacancyForm } = sourceLoader()(
    "@/features/vacancies/vacancy-form-validation"
  )
  for (const salary of ["10000", "$Según experiencia", "$10$00"]) {
    assert.ok(validateVacancyForm({ ...values, salary }, "2026-10-19").salary)
  }
  assert.ok(validateVacancyForm({ ...values, shift: "" }, "2026-10-19").shift)
  assert.ok(
    validateVacancyForm({ ...values, salaryPeriod: null }, "2026-10-19")
      .salaryPeriod
  )
  assert.ok(
    validateVacancyForm({ ...values, deadline: "2026-02-30" }, "2026-10-19")
      .deadline
  )
  assert.ok(
    validateVacancyForm({ ...values, deadline: "2020-01-01" }, "2026-10-19")
      .deadline
  )
  assert.ok(!validateVacancyForm(values, "2026-10-19").salary)
})

function repository(responses) {
  const calls = []
  const supabase = {
    from(table) {
      const call = { table, steps: [] }
      calls.push(call)
      const chain = new Proxy(
        {},
        {
          get(_, method) {
            if (method === "then")
              return (resolve) =>
                Promise.resolve(responses.shift()).then(resolve)
            return (...args) => {
              call.steps.push([method, ...args])
              if (method === "single") return Promise.resolve(responses.shift())
              return chain
            }
          },
        }
      )
      return chain
    },
  }
  const load = sourceLoader({ "@/lib/supabase": { supabase } })
  return { api: load("@/features/vacancies/vacancy-repository"), calls }
}
const values = {
  title: "Operador",
  shift: "Turno 1",
  area: "Producción",
  location: "Querétaro",
  modality: "Presencial",
  employmentType: "Tiempo completo",
  description: "Descripción",
  education: "Secundaria",
  experience: "Sin experiencia",
  requirements: "Medición",
  workSchedule: "6-14",
  workDays: "Lun-Sab",
  restDays: "Dom",
  salary: "$10,000",
  salaryPeriod: "monthly",
  benefits: "Ley",
  status: "published",
  deadline: "2099-12-31",
}

test("repository includes original version and non-archive predicate; conflict is reported without overwriting", async () => {
  const { api, calls } = repository([
    { data: null, error: { code: "PGRST116" } },
  ])
  await assert.rejects(api.updateVacancy("vacancy", 7, values), {
    name: "VacancyConflictError",
  })
  assert.ok(
    calls[0].steps.some(
      ([method, key, value]) =>
        method === "eq" && key === "version" && value === 7
    )
  )
  assert.ok(
    calls[0].steps.some(
      ([method, key, value]) =>
        method === "is" && key === "deleted_at" && value === null
    )
  )
  assert.equal(
    calls[0].steps.find(([method]) => method === "update")[1].version,
    8
  )
})

test("repository public list explicitly filters deadlines even for an editor session", async () => {
  const { api, calls } = repository([{ data: [], error: null, count: 0 }])
  await api.listVacancies({ scope: "public", page: 0 })
  assert.ok(
    calls[0].steps.some(
      ([method, key, value]) =>
        method === "eq" && key === "status" && value === "published"
    )
  )
  assert.ok(
    calls[0].steps.some(
      ([method, key]) => method === "gte" && key === "deadline"
    )
  )
  assert.ok(
    calls[0].steps.some(
      ([method, key, value]) =>
        method === "is" && key === "deleted_at" && value === null
    )
  )
})

test("archive uses versioned UPDATE and never a physical DELETE", async () => {
  const { api, calls } = repository([{ data: { id: "vacancy" }, error: null }])
  await api.setVacancyArchived("vacancy", 4, true)
  assert.equal(
    calls[0].steps.find(([method]) => method === "update")[1].version,
    5
  )
  assert.ok(!calls[0].steps.some(([method]) => method === "delete"))
  assert.ok(
    calls[0].steps.some(
      ([method, key, value]) =>
        method === "eq" && key === "version" && value === 4
    )
  )
})

test("create retry retains one stable ID; changed payload is never silently treated as saved", async () => {
  const { api, calls } = repository([
    { data: null, error: { code: "23505" } },
    { data: { title: "Different saved title" }, error: null },
  ])
  const id = randomUUID()
  await assert.rejects(api.createVacancy(values, id), /ya se guardó/)
  assert.equal(calls[0].steps.find(([method]) => method === "insert")[1].id, id)
  assert.ok(
    calls[1].steps.some(
      ([method, key, value]) => method === "eq" && key === "id" && value === id
    )
  )
})

test("client reuses a page receipt for effect replays, separates navigation/clicks and preserves visitor identity", async () => {
  const payloads = []
  const stored = randomUUID()
  const window = {
    location: { origin: "https://www.vinoplasticrys.lat" },
    localStorage: { getItem: () => stored },
  }
  const load = sourceLoader(
    { "@/lib/supabase": { supabase: null } },
    {
      window,
      fetch: async (_url, options) => {
        payloads.push(JSON.parse(options.body))
        return { ok: true }
      },
    }
  )
  const api = load("@/features/site-analytics/site-analytics")
  const navigation = { path: "/" }
  await api.recordPublicPageView("/", navigation)
  await api.recordPublicPageView("/", navigation)
  await api.recordPublicPageView("/", { path: "/" })
  await api.recordPublicEvent("whatsapp_click", "/")
  await api.recordPublicEvent("whatsapp_click", "/")
  assert.equal(payloads[0].requestId, payloads[1].requestId)
  assert.notEqual(payloads[1].requestId, payloads[2].requestId)
  assert.notEqual(payloads[3].requestId, payloads[4].requestId)
  assert.ok(payloads.every((item) => item.visitorId === stored))
  assert.deepEqual(Object.keys(payloads[3]).sort(), [
    "event",
    "kind",
    "path",
    "requestId",
    "visitorId",
  ])
  window.location.origin = "https://preview.vercel.app"
  await api.recordPublicPageView("/", {})
  assert.equal(payloads.length, 5)
})

test("client records a sanitized failure once without breaking public navigation", async () => {
  const warnings = []
  const api = sourceLoader(
    { "@/lib/supabase": { supabase: null } },
    {
      window: {
        location: { origin: "https://www.vinoplasticrys.lat" },
        localStorage: { getItem: () => randomUUID() },
      },
      fetch: async () => ({ ok: false }),
      console: { warn: (...args) => warnings.push(args) },
    }
  )("@/features/site-analytics/site-analytics")
  await api.recordPublicPageView("/", {})
  await api.recordPublicEvent("whatsapp_click", "/")
  assert.equal(warnings.length, 1)
  assert.equal(warnings[0].length, 1)
})

test("build rejects privileged browser keys without exposing their contents", () => {
  const serviceJwt = `header.${Buffer.from(JSON.stringify({ role: "service_role" })).toString("base64url")}.signature`
  for (const env of [
    { VITE_SUPABASE_PUBLISHABLE_KEY: "sb_secret_test" },
    { VITE_SUPABASE_ANON_KEY: serviceJwt },
    { VITE_PRIVATE_KEY: "sensitive" },
  ]) {
    assert.throws(
      () => assertPublicEnv(env),
      (error) =>
        !Object.values(env).some((value) => error.message.includes(value))
    )
  }
  assert.doesNotThrow(() =>
    assertPublicEnv({
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      SUPABASE_SECRET_KEY: "sb_secret_server_only",
    })
  )
})
