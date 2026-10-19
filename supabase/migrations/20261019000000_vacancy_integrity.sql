-- Apply after the migrations dated 20261016. Preserves existing rows.
begin;

alter table public.vacancies
  add column version bigint not null default 1 check (version > 0),
  add column deleted_at timestamptz;

create table public.vacancy_change_log (
  id bigint generated always as identity primary key,
  vacancy_id text not null,
  actor_id uuid,
  action text not null check (action in ('created', 'updated', 'archived', 'restored', 'deleted')),
  before_data jsonb,
  after_data jsonb,
  changed_at timestamptz not null default now()
);
create index vacancy_change_log_vacancy_idx on public.vacancy_change_log (vacancy_id, changed_at desc);
alter table public.vacancy_change_log enable row level security;
revoke all on public.vacancy_change_log from public, anon, authenticated;
revoke all on sequence public.vacancy_change_log_id_seq from public, anon, authenticated;
grant select on public.vacancy_change_log to authenticated;
create policy vacancy_change_log_editor_read on public.vacancy_change_log
  for select to authenticated using ((select public.is_vacancy_editor()));

create function public.guard_vacancy_write() returns trigger
language plpgsql set search_path = '' as $$
declare content_changed boolean;
begin
  if tg_op = 'INSERT' then
    if new.version <> 1 or new.deleted_at is not null then
      raise exception 'Invalid initial vacancy version' using errcode = '22023';
    end if;
    content_changed := true;
  else
    if new.id is distinct from old.id or new.created_at is distinct from old.created_at then
      raise exception 'Immutable vacancy metadata' using errcode = '42501';
    end if;
    if new.version <> old.version + 1 then
      raise exception 'VACANCY_CONFLICT' using errcode = '40001';
    end if;
    content_changed := (to_jsonb(new) - array['version', 'updated_at', 'deleted_at'])
      is distinct from (to_jsonb(old) - array['version', 'updated_at', 'deleted_at']);
    if old.deleted_at is null and new.deleted_at is not null then
      new.deleted_at := clock_timestamp();
    elsif old.deleted_at is not null and new.deleted_at is not null then
      new.deleted_at := old.deleted_at;
    end if;
  end if;
  -- Archiving/restoring a legacy record does not force rewriting its contents.
  -- Incomplete legacy imports remain editable drafts; publication is validated here.
  if content_changed and new.status = 'published' then
    if btrim(new.shift) = '' or lower(btrim(new.shift)) = 'por definir' then
      raise exception 'A work shift is required' using errcode = '23514';
    end if;
    if new.salary_period is null or new.salary_period not in ('weekly', 'monthly') then
      raise exception 'A salary period is required' using errcode = '23514';
    end if;
    if left(new.salary, 1) <> '$' or new.salary !~ '[0-9]'
      or position('$' in substring(new.salary from 2)) > 0 then
      raise exception 'Invalid gross salary' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function public.guard_vacancy_write() from public, anon, authenticated;
create trigger vacancies_guard_write before insert or update on public.vacancies
  for each row execute function public.guard_vacancy_write();

create function public.audit_vacancy_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare change_action text;
begin
  if tg_op = 'DELETE' then change_action := 'deleted';
  elsif tg_op = 'INSERT' then change_action := 'created';
  elsif old.deleted_at is null and new.deleted_at is not null then change_action := 'archived';
  elsif old.deleted_at is not null and new.deleted_at is null then change_action := 'restored';
  else change_action := 'updated'; end if;
  insert into public.vacancy_change_log (vacancy_id, actor_id, action, before_data, after_data)
  values (case when tg_op = 'DELETE' then old.id else new.id end, auth.uid(), change_action,
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end);
  return null;
end;
$$;
revoke all on function public.audit_vacancy_change() from public, anon, authenticated;
create trigger vacancies_audit_change after insert or update or delete on public.vacancies
  for each row execute function public.audit_vacancy_change();

-- Editors archive with UPDATE. Physical deletion is no longer exposed to clients.
revoke delete on public.vacancies from authenticated;
drop policy vacancies_editor_delete on public.vacancies;
drop policy vacancies_public_select on public.vacancies;
create policy vacancies_public_select on public.vacancies for select to anon, authenticated
using (status = 'published' and deleted_at is null
  and deadline >= (now() at time zone 'America/Mexico_City')::date);

create or replace function public.public_vacancy_areas() returns table (area text)
language sql stable security invoker set search_path = '' as $$
  select distinct v.area from public.vacancies v
  where v.status = 'published' and v.deleted_at is null
    and v.deadline >= (now() at time zone 'America/Mexico_City')::date
  order by v.area;
$$;
create or replace function public.vacancy_counts()
returns table (total bigint, published bigint, draft bigint)
language sql stable security invoker set search_path = '' as $$
  select count(*), count(*) filter (where status = 'published'), count(*) filter (where status = 'draft')
  from public.vacancies where deleted_at is null;
$$;
notify pgrst, 'reload schema';
commit;
