-- Las vistas públicas se agregan por día, página y navegador. No se guardan IP ni user agent.
create table public.site_visit_daily (
  visit_day date not null,
  page_path text not null check (page_path in ('/', '/about', '/contact', '/vacancies')),
  visitor_id uuid not null,
  views integer not null default 1 check (views > 0),
  primary key (visit_day, page_path, visitor_id)
);

create index site_visit_daily_page_idx
  on public.site_visit_daily (page_path, visit_day);

alter table public.site_visit_daily enable row level security;
revoke all on table public.site_visit_daily from anon, authenticated;

create function public.record_site_view(p_path text, p_visitor_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_path not in ('/', '/about', '/contact', '/vacancies')
    or p_visitor_id is null then
    raise exception 'Página o visitante no válido' using errcode = '22023';
  end if;

  insert into public.site_visit_daily (visit_day, page_path, visitor_id)
  values ((now() at time zone 'America/Mexico_City')::date, p_path, p_visitor_id)
  on conflict (visit_day, page_path, visitor_id)
  do update set views = public.site_visit_daily.views + 1;
end;
$$;

revoke all on function public.record_site_view(text, uuid) from public, anon, authenticated;
grant execute on function public.record_site_view(text, uuid) to anon, authenticated;

create function public.site_visit_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  today date := (now() at time zone 'America/Mexico_City')::date;
  result jsonb;
begin
  if not public.is_vacancy_editor() then
    raise exception 'Sin permiso para ver las visitas' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'totalViews', coalesce(sum(visit.views), 0),
    'uniqueVisitors', count(distinct visit.visitor_id),
    'todayViews', coalesce(sum(visit.views) filter (where visit.visit_day = today), 0),
    'pages', (
      select coalesce(jsonb_agg(to_jsonb(page) order by page.views desc), '[]'::jsonb)
      from (
        select page_path as path,
          sum(views) as views,
          count(distinct visitor_id) as visitors
        from public.site_visit_daily
        group by page_path
      ) as page
    )
  ) into result
  from public.site_visit_daily as visit;

  return result;
end;
$$;

revoke all on function public.site_visit_summary() from public, anon, authenticated;
grant execute on function public.site_visit_summary() to authenticated;

notify pgrst, 'reload schema';
