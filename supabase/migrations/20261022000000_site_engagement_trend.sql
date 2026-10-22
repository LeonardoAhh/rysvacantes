-- Conserva los agregados existentes y añade una serie diaria desde la primera actividad.
create or replace function public.site_engagement_summary(p_days integer default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'America/Mexico_City')::date;
  first_day date;
  result jsonb;
begin
  if not public.is_vacancy_editor() then
    raise exception 'Sin permiso para ver las visitas' using errcode = '42501';
  end if;
  if p_days is not null and p_days not in (7, 30) then
    raise exception 'Periodo no válido' using errcode = '22023';
  end if;

  first_day := case
    when p_days is not null then today - (p_days - 1)
    else least(
      coalesce((select min(visit_day) from public.site_visit_daily where visit_day <= today), today),
      coalesce((select min(event_day) from public.site_event_daily where event_day <= today), today)
    )
  end;

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
    ),
    'trend', (
      with days as (
        select generated.day::date as day
        from generate_series(first_day, today, interval '1 day') as generated(day)
      ),
      daily_visits as (
        select visit_day as day, sum(views) as views,
          count(distinct visitor_id) as visitors
        from public.site_visit_daily where visit_day between first_day and today
        group by visit_day
      ),
      daily_events as (
        select event_day as day, sum(clicks) as interactions
        from public.site_event_daily where event_day between first_day and today
        group by event_day
      )
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', days.day,
        'views', coalesce(daily_visits.views, 0),
        'visitors', coalesce(daily_visits.visitors, 0),
        'interactions', coalesce(daily_events.interactions, 0)
      ) order by days.day), '[]'::jsonb)
      from days
      left join daily_visits using (day)
      left join daily_events using (day)
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
