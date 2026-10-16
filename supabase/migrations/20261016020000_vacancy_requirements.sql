-- Aplicar antes de desplegar el cliente que captura el perfil del puesto.
-- No modifica los requisitos de publicación de las vacantes existentes.
begin;

alter table public.vacancies
  add column if not exists education text not null default '',
  add column if not exists experience text not null default '',
  add column if not exists requirements text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'vacancies_profile_lengths'
      and conrelid = 'public.vacancies'::regclass
  ) then
    alter table public.vacancies
      add constraint vacancies_profile_lengths check (
        char_length(education) <= 160
        and char_length(experience) <= 400
        and char_length(requirements) <= 1600
      );
  end if;
end
$$;

comment on column public.vacancies.education is 'Escolaridad solicitada para el puesto; opcional.';
comment on column public.vacancies.experience is 'Experiencia solicitada para el puesto; opcional.';
comment on column public.vacancies.requirements is 'Conocimientos y habilidades, uno por renglón; no documentos de contratación.';

notify pgrst, 'reload schema';

commit;
