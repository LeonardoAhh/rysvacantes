-- Apply after 20261015000000_vacancies.sql. No other tables are changed.
begin;

alter table public.vacancies
  add column if not exists shift text not null default '';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vacancies_shift_length_check'
      and conrelid = 'public.vacancies'::regclass
  ) then
    alter table public.vacancies
      add constraint vacancies_shift_length_check
      check (char_length(shift) <= 40);
  end if;
end
$$;

-- Move only an explicit trailing "-Turno X" into the new field.
-- Titles without that suffix stay unchanged; a populated shift is never replaced.
with candidates as (
  select
    id,
    btrim(regexp_replace(
      title,
      '[[:space:]]*[-–—][[:space:]]*turno[[:space:]]+[[:alnum:]]+[[:space:]]*$',
      '',
      'i'
    )) as position_title,
    (regexp_match(
      title,
      '[[:space:]]*[-–—][[:space:]]*(turno[[:space:]]+[[:alnum:]]+)[[:space:]]*$',
      'i'
    ))[1] as parsed_shift
  from public.vacancies
  where shift = ''
)
update public.vacancies as vacancy
set
  title = candidate.position_title,
  shift = initcap(candidate.parsed_shift)
from candidates as candidate
where vacancy.id = candidate.id
  and candidate.parsed_shift is not null
  and candidate.position_title <> ''
  and char_length(candidate.parsed_shift) <= 40;

comment on column public.vacancies.shift is
  'Optional work shift label, displayed beside the position title.';

notify pgrst, 'reload schema';

commit;
