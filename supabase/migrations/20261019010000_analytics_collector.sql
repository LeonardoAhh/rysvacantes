-- Deploy with the server collector. Historical statistics are not deleted.
begin;
create table public.analytics_receipts (
  request_id uuid primary key,
  kind text not null,
  event_name text,
  page_path text not null,
  visitor_id uuid not null,
  created_at timestamptz not null default now()
);
create index analytics_receipts_created_idx on public.analytics_receipts (created_at);
create table public.analytics_rate_windows (
  bucket_start timestamptz not null,
  bucket_key text not null,
  attempts integer not null check (attempts > 0),
  primary key (bucket_start, bucket_key)
);
alter table public.analytics_receipts enable row level security;
alter table public.analytics_rate_windows enable row level security;
revoke all on public.analytics_receipts, public.analytics_rate_windows from public, anon, authenticated;

create function public.cleanup_analytics_buffers() returns void
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.analytics_receipts where request_id in (
    select request_id from public.analytics_receipts where created_at < now() - interval '2 days'
    order by created_at limit 500
  );
  delete from public.analytics_rate_windows where (bucket_start, bucket_key) in (
    select bucket_start, bucket_key from public.analytics_rate_windows
    where bucket_start < date_trunc('day', now()) - interval '2 days'
    order by bucket_start limit 500
  );
end;
$$;
revoke all on function public.cleanup_analytics_buffers() from public, anon, authenticated;
grant execute on function public.cleanup_analytics_buffers() to service_role;

create function public.ingest_site_activity(
  p_kind text, p_event text, p_path text, p_visitor_id uuid, p_request_id uuid, p_client_hash text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  receipt public.analytics_receipts%rowtype;
  minute_bucket timestamptz := date_trunc('minute', now());
  day_bucket timestamptz := date_trunc('day', now());
  visit_date date := (now() at time zone 'America/Mexico_City')::date;
begin
  if p_kind is null or p_kind not in ('view', 'event')
    or p_path is null or p_path not in ('/', '/about', '/contact', '/vacancies', '/transporte')
    or p_visitor_id is null or p_request_id is null
    or p_client_hash is null or p_client_hash !~ '^[0-9a-f]{64}$'
    or (p_kind = 'view' and p_event is not null)
    or (p_kind = 'event' and (p_event is null or p_event not in (
      'home_vacancies', 'vacancy_detail', 'contact_click', 'transport_click', 'whatsapp_click'
    )))
    or (p_event = 'home_vacancies' and p_path <> '/')
    or (p_event = 'vacancy_detail' and p_path <> '/vacancies') then
    raise exception 'Invalid analytics request' using errcode = '22023';
  end if;
  -- Bounded critical section: quotas and idempotency are shared by all server instances.
  perform pg_advisory_xact_lock(4819, 19);
  select * into receipt from public.analytics_receipts where request_id = p_request_id;
  if found then
    if receipt.kind <> p_kind or receipt.page_path <> p_path or receipt.visitor_id <> p_visitor_id
      or receipt.event_name is distinct from p_event then
      return jsonb_build_object('accepted', false, 'reason', 'request_conflict');
    end if;
    return jsonb_build_object('accepted', true, 'duplicate', true);
  end if;
  if exists (select 1 from public.analytics_rate_windows
    where bucket_start = day_bucket and bucket_key = 'global' and attempts >= 50000)
    or exists (select 1 from public.analytics_rate_windows
      where bucket_start = minute_bucket and bucket_key = 'minute:' || p_client_hash and attempts >= 120)
    or exists (select 1 from public.analytics_rate_windows
      where bucket_start = day_bucket and bucket_key = 'day:' || p_client_hash and attempts >= 3000) then
    return jsonb_build_object('accepted', false, 'reason', 'rate_limited');
  end if;
  insert into public.analytics_rate_windows (bucket_start, bucket_key, attempts)
  values (day_bucket, 'global', 1), (minute_bucket, 'minute:' || p_client_hash, 1),
    (day_bucket, 'day:' || p_client_hash, 1)
  on conflict (bucket_start, bucket_key) do update set attempts = public.analytics_rate_windows.attempts + 1;
  insert into public.analytics_receipts (request_id, kind, event_name, page_path, visitor_id)
  values (p_request_id, p_kind, p_event, p_path, p_visitor_id);
  if p_kind = 'view' then
    insert into public.site_visit_daily (visit_day, page_path, visitor_id)
    values (visit_date, p_path, p_visitor_id)
    on conflict (visit_day, page_path, visitor_id) do update set views = public.site_visit_daily.views + 1;
  else
    insert into public.site_event_daily (event_day, page_path, event_name, visitor_id)
    values (visit_date, p_path, p_event, p_visitor_id)
    on conflict (event_day, page_path, event_name, visitor_id) do update set clicks = public.site_event_daily.clicks + 1;
  end if;
  perform public.cleanup_analytics_buffers();
  return jsonb_build_object('accepted', true, 'duplicate', false);
end;
$$;
revoke all on function public.ingest_site_activity(text,text,text,uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.ingest_site_activity(text,text,text,uuid,uuid,text) to service_role;
-- No public bypass of the server's IP-derived quotas.
revoke all on function public.record_site_view(text,uuid) from public, anon, authenticated;
revoke all on function public.record_site_event(text,text,uuid) from public, anon, authenticated;
notify pgrst, 'reload schema';
commit;
