-- Ejecutar solo esta migración en el proyecto de Supabase de este sitio.
-- Ninguna vacante de ejemplo se inserta automáticamente.

create table public.vacancy_editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.vacancy_editors enable row level security;
revoke all on table public.vacancy_editors from anon, authenticated;

create function public.is_vacancy_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.vacancy_editors as editor
      where editor.user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_vacancy_editor() from public, anon, authenticated;
grant execute on function public.is_vacancy_editor() to authenticated;

create table public.vacancies (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  area text not null,
  location text not null,
  modality text not null,
  employment_type text not null,
  description text not null default '',
  work_schedule text not null default '',
  work_days text not null default '',
  rest_days text not null default '',
  salary text not null default '',
  benefits text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'paused', 'filled')),
  deadline date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vacancies_field_lengths check (
    char_length(id) between 1 and 100
    and char_length(btrim(title)) between 1 and 100
    and char_length(btrim(area)) between 1 and 80
    and char_length(btrim(location)) between 1 and 100
    and char_length(btrim(modality)) between 1 and 60
    and char_length(btrim(employment_type)) between 1 and 60
    and char_length(description) <= 2400
    and char_length(work_schedule) <= 120
    and char_length(work_days) <= 120
    and char_length(rest_days) <= 120
    and char_length(salary) <= 120
    and char_length(benefits) <= 1200
  ),
  constraint vacancies_published_details check (
    status <> 'published' or (
      btrim(description) <> ''
      and btrim(work_schedule) <> ''
      and btrim(work_days) <> ''
      and btrim(rest_days) <> ''
      and btrim(salary) <> ''
      and btrim(benefits) <> ''
      and lower(btrim(description)) <> 'por definir'
      and lower(btrim(work_schedule)) <> 'por definir'
      and lower(btrim(work_days)) <> 'por definir'
      and lower(btrim(rest_days)) <> 'por definir'
      and lower(btrim(salary)) <> 'por definir'
      and lower(btrim(benefits)) <> 'por definir'
    )
  )
);

create index vacancies_created_at_idx
  on public.vacancies (created_at desc, id desc);
create index vacancies_status_created_at_idx
  on public.vacancies (status, created_at desc, id desc);
create index vacancies_status_area_created_at_idx
  on public.vacancies (status, area, created_at desc, id desc);

create function public.set_vacancy_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_vacancy_updated_at()
  from public, anon, authenticated;

create trigger vacancies_set_updated_at
before update on public.vacancies
for each row execute function public.set_vacancy_updated_at();

alter table public.vacancies enable row level security;
revoke all on table public.vacancies from anon, authenticated;
grant select on table public.vacancies to anon, authenticated;
grant insert, update, delete on table public.vacancies to authenticated;

create policy vacancies_public_select
on public.vacancies for select
to anon, authenticated
using (status = 'published');

create policy vacancies_editor_select
on public.vacancies for select
to authenticated
using ((select public.is_vacancy_editor()));

create policy vacancies_editor_insert
on public.vacancies for insert
to authenticated
with check ((select public.is_vacancy_editor()));

create policy vacancies_editor_update
on public.vacancies for update
to authenticated
using ((select public.is_vacancy_editor()))
with check ((select public.is_vacancy_editor()));

create policy vacancies_editor_delete
on public.vacancies for delete
to authenticated
using ((select public.is_vacancy_editor()));

create function public.public_vacancy_areas()
returns table (area text)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct vacancy.area
  from public.vacancies as vacancy
  where vacancy.status = 'published'
  order by vacancy.area;
$$;

revoke all on function public.public_vacancy_areas()
  from public, anon, authenticated;
grant execute on function public.public_vacancy_areas()
  to anon, authenticated;

create function public.vacancy_counts()
returns table (total bigint, published bigint, draft bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*),
    count(*) filter (where status = 'published'),
    count(*) filter (where status = 'draft')
  from public.vacancies;
$$;

revoke all on function public.vacancy_counts()
  from public, anon, authenticated;
grant execute on function public.vacancy_counts() to authenticated;
