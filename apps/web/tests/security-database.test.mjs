import { after, before, test } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { readdir, readFile } from "node:fs/promises"
import { PGlite } from "@electric-sql/pglite"

// Real PostgreSQL in memory. No environment variables or external database.
const db = new PGlite()
const editor = randomUUID()
const outsider = randomUUID()
const visitor = randomUUID()
const hash = "a".repeat(64)
const migrations = new URL("../../../supabase/migrations/", import.meta.url)
// Tests live in apps/web/tests: root is three levels above.
const query = (sql, params) => db.query(sql, params)
async function asRole(role, user, sql, params = []) {
  await db.exec(`begin; set local role ${role};`)
  try {
    await query("select set_config('request.jwt.claim.sub', $1, true)", [
      user ?? "",
    ])
    const result = await query(sql, params)
    await db.exec("commit")
    return result
  } catch (error) {
    await db.exec("rollback")
    throw error
  }
}
async function insertVacancy(
  id,
  status = "published",
  deadline = "2099-12-31"
) {
  return asRole(
    "authenticated",
    editor,
    `insert into public.vacancies
    (id,title,area,location,modality,employment_type,description,work_schedule,work_days,rest_days,salary,salary_period,shift,benefits,status,deadline)
    values ($1,'Operador','Producción','Querétaro','Presencial','Tiempo completo','Descripción','6-14','Lun-Sab','Dom','$10,000','monthly','Turno 1','Ley',$2,$3) returning *`,
    [id, status, deadline]
  )
}
const collectSql =
  "select public.ingest_site_activity($1,$2,$3,$4,$5,$6) as result"
function collect({
  kind = "view",
  event = null,
  path = "/",
  request = randomUUID(),
  id = visitor,
  clientHash = hash,
} = {}) {
  return asRole("service_role", null, collectSql, [
    kind,
    event,
    path,
    id,
    request,
    clientHash,
  ])
}

before(async () => {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;`)
  await query("insert into auth.users values ($1),($2)", [editor, outsider])
  const files = (await readdir(migrations))
    .filter((name) => name.endsWith(".sql"))
    .sort()
  for (const file of files) {
    if (file.startsWith("20261019")) continue
    await db.exec(await readFile(new URL(file, migrations), "utf8"))
  }
  await query("insert into public.vacancy_editors(user_id) values ($1)", [
    editor,
  ])
  // Historical data must survive every new migration unchanged.
  await db.exec(`insert into public.vacancies(id,title,area,location,modality,employment_type,deadline)
    values ('legacy','Anterior','Área','Ubicación','Presencial','Tiempo completo','2020-01-01')`)
  await query(
    "insert into public.site_visit_daily values ('2020-01-01','/',$1,17)",
    [visitor]
  )
  await query(
    "insert into public.site_event_daily values ('2020-01-01','/','whatsapp_click',$1,9)",
    [visitor]
  )
  for (const file of files.filter((name) => name.startsWith("20261019"))) {
    await db.exec(await readFile(new URL(file, migrations), "utf8"))
  }
  await insertVacancy("active")
  await insertVacancy("expired", "published", "2020-01-01")
  await insertVacancy("draft", "draft")
})
after(() => db.close())

test("public RLS hides expired, draft and archived records; editors keep them", async () => {
  for (const [role, user] of [
    ["anon", null],
    ["authenticated", outsider],
  ]) {
    const result = await asRole(
      role,
      user,
      "select id from public.vacancies order by id"
    )
    assert.deepEqual(
      result.rows.map((row) => row.id),
      ["active"]
    )
  }
  assert.equal(
    (await asRole("authenticated", editor, "select id from public.vacancies"))
      .rows.length,
    4
  )
})

test("non-editors cannot write or grant themselves editor membership", async () => {
  for (const [role, user] of [
    ["anon", null],
    ["authenticated", outsider],
  ]) {
    await assert.rejects(
      asRole(
        role,
        user,
        "insert into public.vacancies(id,title,area,location,modality,employment_type,deadline) values ('attack','x','x','x','x','x','2099-01-01')"
      ),
      { code: "42501" }
    )
    await assert.rejects(
      asRole(
        role,
        user,
        "insert into public.vacancy_editors(user_id) values ($1)",
        [outsider]
      ),
      { code: "42501" }
    )
    if (role === "authenticated") {
      assert.equal(
        (
          await asRole(
            role,
            user,
            "update public.vacancies set title='attack', version=version+1 where id='active'"
          )
        ).affectedRows,
        0
      )
    } else
      await assert.rejects(
        asRole(role, user, "update public.vacancies set title='attack'"),
        { code: "42501" }
      )
  }
})

test("version predicates reject stale edits and trigger enforces version advancement", async () => {
  const first = await asRole(
    "authenticated",
    editor,
    "update public.vacancies set title='Primero',version=2 where id='active' and version=1 returning version"
  )
  assert.equal(first.rows[0].version, 2)
  assert.equal(
    (
      await asRole(
        "authenticated",
        editor,
        "update public.vacancies set title='Perdido',version=2 where id='active' and version=1"
      )
    ).affectedRows,
    0
  )
  await assert.rejects(
    asRole(
      "authenticated",
      editor,
      "update public.vacancies set title='Sin versión' where id='active'"
    ),
    { code: "40001" }
  )
  await assert.rejects(
    asRole(
      "authenticated",
      editor,
      "update public.vacancies set id='otro', version=3 where id='active'"
    ),
    { code: "42501" }
  )
})

test("archive and restore preserve content, increment versions and create protected history", async () => {
  await asRole(
    "authenticated",
    editor,
    "update public.vacancies set deleted_at=now(),version=3 where id='active' and version=2"
  )
  assert.equal(
    (
      await asRole(
        "anon",
        null,
        "select id from public.vacancies where id='active'"
      )
    ).rows.length,
    0
  )
  assert.equal(
    (
      await asRole(
        "authenticated",
        editor,
        "select * from public.vacancy_counts()"
      )
    ).rows[0].total,
    3
  )
  await asRole(
    "authenticated",
    editor,
    "update public.vacancies set deleted_at=null,version=4 where id='active' and version=3"
  )
  assert.equal(
    (
      await asRole(
        "anon",
        null,
        "select title from public.vacancies where id='active'"
      )
    ).rows[0].title,
    "Primero"
  )
  const actions = await asRole(
    "authenticated",
    editor,
    "select action,actor_id from public.vacancy_change_log where vacancy_id='active' order by id"
  )
  assert.deepEqual(
    actions.rows.map((row) => row.action),
    ["created", "updated", "archived", "restored"]
  )
  assert.ok(actions.rows.every((row) => row.actor_id === editor))
  await assert.rejects(
    asRole(
      "authenticated",
      editor,
      "delete from public.vacancies where id='active'"
    ),
    { code: "42501" }
  )
  await assert.rejects(
    asRole("authenticated", editor, "delete from public.vacancy_change_log"),
    { code: "42501" }
  )
  await assert.rejects(
    asRole(
      "authenticated",
      editor,
      "select setval('public.vacancy_change_log_id_seq', 1)"
    ),
    { code: "42501" }
  )
  assert.equal(
    (
      await asRole(
        "authenticated",
        outsider,
        "select * from public.vacancy_change_log"
      )
    ).rows.length,
    0
  )
  await assert.rejects(
    asRole("anon", null, "select * from public.vacancy_change_log"),
    { code: "42501" }
  )
})

test("publication validates shift, salary and period; incomplete legacy drafts remain preserved", async () => {
  for (const update of [
    "shift=''",
    "salary_period=null",
    "salary='10000'",
    "salary='$10$00'",
  ]) {
    await assert.rejects(
      asRole(
        "authenticated",
        editor,
        `update public.vacancies set ${update},version=version+1 where id='active'`
      ),
      { code: "23514" }
    )
  }
  const legacy = (
    await query(
      "select shift,salary_period,version from public.vacancies where id='legacy'"
    )
  ).rows[0]
  assert.deepEqual(legacy, { shift: "", salary_period: null, version: 1 })
  await asRole(
    "authenticated",
    editor,
    "update public.vacancies set deleted_at=now(),version=2 where id='legacy'"
  )
  await asRole(
    "authenticated",
    editor,
    "update public.vacancies set deleted_at=null,version=3 where id='legacy'"
  )
})

test("old public RPCs, private buffers and service collector are inaccessible to browsers", async () => {
  for (const [role, user] of [
    ["anon", null],
    ["authenticated", outsider],
    ["authenticated", editor],
  ]) {
    for (const sql of [
      `select public.record_site_view('/', '${visitor}')`,
      `select public.record_site_event('whatsapp_click','/', '${visitor}')`,
      `select public.ingest_site_activity('view',null,'/','${visitor}','${randomUUID()}','${hash}')`,
      "select public.cleanup_analytics_buffers()",
      "select * from public.analytics_receipts",
      "select * from public.analytics_rate_windows",
      "select * from public.site_visit_daily",
    ])
      await assert.rejects(asRole(role, user, sql), { code: "42501" })
  }
  await assert.rejects(
    asRole(
      "authenticated",
      outsider,
      "select public.site_engagement_summary(7)"
    ),
    { code: "42501" }
  )
  assert.ok(
    (
      await asRole(
        "authenticated",
        editor,
        "select public.site_engagement_summary(7) as summary"
      )
    ).rows[0].summary
  )
})

test("receipt idempotency counts one action, separates real actions and rejects request reuse", async () => {
  const request = randomUUID()
  assert.equal((await collect({ request })).rows[0].result.accepted, true)
  assert.equal((await collect({ request })).rows[0].result.duplicate, true)
  assert.equal(
    (await collect({ request, path: "/contact" })).rows[0].result.reason,
    "request_conflict"
  )
  await collect()
  const result = await query(
    "select views from public.site_visit_daily where visit_day=(now() at time zone 'America/Mexico_City')::date and page_path='/' and visitor_id=$1",
    [visitor]
  )
  assert.equal(result.rows[0].views, 2)
  const event = {
    kind: "event",
    event: "whatsapp_click",
    request: randomUUID(),
  }
  await collect(event)
  await collect(event)
  assert.equal(
    (
      await query(
        "select clicks from public.site_event_daily where event_day=(now() at time zone 'America/Mexico_City')::date and visitor_id=$1",
        [visitor]
      )
    ).rows[0].clicks,
    1
  )
  await collect({ path: "/transporte" })
})

test("shared quotas cannot be bypassed by rotating visitor IDs; invalid events are rejected", async () => {
  const limitedHash = "b".repeat(64)
  await query(
    "insert into public.analytics_rate_windows values(date_trunc('minute',now()),$1,120)",
    ["minute:" + limitedHash]
  )
  assert.equal(
    (await collect({ clientHash: limitedHash, id: randomUUID() })).rows[0]
      .result.reason,
    "rate_limited"
  )
  await assert.rejects(
    collect({ kind: "event", event: "vacancy_detail", path: "/" }),
    { code: "22023" }
  )
  await assert.rejects(collect({ path: "/dashboard" }), { code: "22023" })
  await assert.rejects(collect({ clientHash: "spoofed" }), { code: "22023" })
})

test("temporary cleanup never removes historical views or interactions", async () => {
  await query(
    "insert into public.analytics_receipts(request_id,kind,page_path,visitor_id,created_at) values($1,'view','/',$2,now()-interval '3 days')",
    [randomUUID(), visitor]
  )
  await asRole(
    "service_role",
    null,
    "select public.cleanup_analytics_buffers()"
  )
  assert.equal(
    (
      await query(
        "select * from public.analytics_receipts where created_at<now()-interval '2 days'"
      )
    ).rows.length,
    0
  )
  assert.equal(
    (
      await query(
        "select views from public.site_visit_daily where visit_day='2020-01-01'"
      )
    ).rows[0].views,
    17
  )
  assert.equal(
    (
      await query(
        "select clicks from public.site_event_daily where event_day='2020-01-01'"
      )
    ).rows[0].clicks,
    9
  )
})

test("daily client and global budgets remain effective across fresh request IDs", async () => {
  const clientHash = "c".repeat(64)
  await query(
    "insert into public.analytics_rate_windows values(date_trunc('day',now()),$1,3000)",
    ["day:" + clientHash]
  )
  assert.equal(
    (await collect({ clientHash })).rows[0].result.reason,
    "rate_limited"
  )
  await query(
    "update public.analytics_rate_windows set attempts=50000 where bucket_key='global' and bucket_start=date_trunc('day',now())"
  )
  assert.equal(
    (await collect({ clientHash: "d".repeat(64) })).rows[0].result.reason,
    "rate_limited"
  )
})
