-- Amplía las visitas existentes y agrega señales de interés sin datos personales.
alter table public.site_visit_daily
  drop constraint site_visit_daily_page_path_check;
alter table public.site_visit_daily
  add constraint site_visit_daily_page_path_check
  check (page_path in ('/', '/about', '/contact', '/vacancies', '/transporte'));

create or replace function public.record_site_view(p_path text, p_visitor_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_path is null or p_path not in ('/', '/about', '/contact', '/vacancies', '/transporte')
    or p_visitor_id is null then
    raise exception 'Página o visitante no válido' using errcode = '22023';
  end if;
  insert into public.site_visit_daily (visit_day, page_path, visitor_id)
  values ((now() at time zone 'America/Mexico_City')::date, p_path, p_visitor_id)
  on conflict (visit_day, page_path, visitor_id)
  do update set views = public.site_visit_daily.views + 1;
end;
$$;

create table public.site_event_daily (
  event_day date not null,
  page_path text not null check (page_path in ('/', '/about', '/contact', '/vacancies', '/transporte')),
  event_name text not null check (event_name in (
    'home_vacancies', 'vacancy_detail', 'contact_click', 'transport_click', 'whatsapp_click'
  )),
  visitor_id uuid not null,
  clicks integer not null default 1 check (clicks > 0),
  primary key (event_day, page_path, event_name, visitor_id)
);
alter table public.site_event_daily enable row level security;
revoke all on table public.site_event_daily from anon, authenticated;

create function public.record_site_event(p_event text, p_path text, p_visitor_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_path is null or p_path not in ('/', '/about', '/contact', '/vacancies', '/transporte')
    or p_visitor_id is null
    or p_event is null or p_event not in (
      'home_vacancies', 'vacancy_detail', 'contact_click', 'transport_click', 'whatsapp_click'
    ) then
    raise exception 'Interacción no válida' using errcode = '22023';
  end if;
  if (p_event = 'home_vacancies' and p_path <> '/')
    or (p_event = 'vacancy_detail' and p_path <> '/vacancies') then
    raise exception 'Página no válida para esta interacción' using errcode = '22023';
  end if;
  insert into public.site_event_daily (event_day, page_path, event_name, visitor_id)
  values ((now() at time zone 'America/Mexico_City')::date, p_path, p_event, p_visitor_id)
  on conflict (event_day, page_path, event_name, visitor_id)
  do update set clicks = public.site_event_daily.clicks + 1;
end;
$$;
revoke all on function public.record_site_event(text, text, uuid) from public, anon, authenticated;
grant execute on function public.record_site_event(text, text, uuid) to anon, authenticated;

-- Se conserva site_visit_summary() para clientes anteriores durante el despliegue.
create function public.site_engagement_summary(p_days integer default 7)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'America/Mexico_City')::date;
  first_day date;
  result jsonb;
begin
  if not public.is_vacancy_editor() then
    raise exception 'Sin permiso para ver las visitas' using errcode = '42501';
  end if;
  if p_days is null or p_days not in (7, 30) then
    raise exception 'Periodo no válido' using errcode = '22023';
  end if;
  first_day := today - (p_days - 1);
  select jsonb_build_object(
    'totalViews', coalesce(sum(visit.views), 0),
    'uniqueVisitors', count(distinct visit.visitor_id),
    'todayViews', coalesce(sum(visit.views) filter (where visit.visit_day = today), 0),
    'pages', (
      select coalesce(jsonb_agg(to_jsonb(page) order by page.views desc, page.path), '[]'::jsonb)
      from (
        select page_path as path, sum(views) as views, count(distinct visitor_id) as visitors
        from public.site_visit_daily where visit_day between first_day and today
        group by page_path
      ) as page
    ),
    'events', (
      select coalesce(jsonb_agg(to_jsonb(event) order by event.name), '[]'::jsonb)
      from (
        select event_name as name, sum(clicks) as clicks, count(distinct visitor_id) as visitors
        from public.site_event_daily where event_day between first_day and today
        group by event_name
      ) as event
    )
  ) into result
  from public.site_visit_daily as visit
  where visit.visit_day between first_day and today;
  return result;
end;
$$;
revoke all on function public.site_engagement_summary(integer) from public, anon, authenticated;
grant execute on function public.site_engagement_summary(integer) to authenticated;
notify pgrst, 'reload schema';
