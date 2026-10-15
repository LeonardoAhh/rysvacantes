-- Existing vacancies keep an unknown period until an editor chooses one.
-- The nullable column lets older clients continue creating vacancies during rollout.
alter table public.vacancies
  add column if not exists salary_period text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'vacancies_salary_period_check'
      and conrelid = 'public.vacancies'::regclass
  ) then
    alter table public.vacancies
      add constraint vacancies_salary_period_check
      check (salary_period in ('weekly', 'monthly'));
  end if;
end
$$;

comment on column public.vacancies.salary_period is
  'Gross salary period: weekly or monthly; null for legacy vacancies awaiting review.';

-- Rollback after reverting the client: drop this column only if losing newly set
-- periods is acceptable. Existing salary text is unaffected.
-- alter table public.vacancies drop column salary_period;
