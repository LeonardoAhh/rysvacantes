-- READ ONLY. Run in the intended project's SQL editor before deployment.
-- Returns metadata and aggregate counts, never tokens, accounts or individual visitors.
begin read only;
select current_database() as database_name, current_user as inspected_as;
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public'
  and tablename in ('vacancies','vacancy_editors','vacancy_change_log','site_visit_daily',
    'site_event_daily','analytics_receipts','analytics_rate_windows')
order by tablename, policyname;
select table_name, column_name, data_type
from information_schema.columns where table_schema='public'
  and table_name='vacancies' and column_name in ('version','deleted_at','shift','salary_period')
order by column_name;
select p.oid::regprocedure::text as signature, p.prosecdef as security_definer,
  p.proconfig as function_settings,
  has_function_privilege('anon', p.oid, 'execute') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'execute') as authenticated_execute,
  has_function_privilege('service_role', p.oid, 'execute') as service_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in (
  'is_vacancy_editor','guard_vacancy_write','audit_vacancy_change',
  'record_site_view','record_site_event','ingest_site_activity','cleanup_analytics_buffers',
  'site_engagement_summary','site_visit_summary')
order by signature;
select grantee, table_name, privilege_type from information_schema.role_table_grants
where table_schema='public' and grantee in ('anon','authenticated','PUBLIC')
  and table_name in ('vacancies','vacancy_editors','vacancy_change_log','site_visit_daily',
    'site_event_daily','analytics_receipts','analytics_rate_windows')
order by table_name, grantee, privilege_type;
select status, count(*) as records,
  count(*) filter(where deadline < (now() at time zone 'America/Mexico_City')::date) as expired
from public.vacancies group by status order by status;
select 'views' as kind, count(*) as aggregate_rows, coalesce(sum(views),0) as actions,
  min(visit_day) as oldest_day, max(visit_day) as newest_day from public.site_visit_daily
union all
select 'events',count(*),coalesce(sum(clicks),0),min(event_day),max(event_day) from public.site_event_daily;
rollback;
