-- Permission dynamique du module « Parcours du Major ».
-- Valeurs initiales demandées : Intensive et Approfondi uniquement.

alter table public.formula_permissions
  add column if not exists parcours_major boolean not null default false;

update public.formula_permissions
set parcours_major = (offer in ('intensif', 'approfondi')),
    updated_at = now()
where offer in ('essentiel', 'intensif', 'approfondi');

drop policy if exists major_parcours_read on public.major_parcours;
create policy major_parcours_read on public.major_parcours
  for select to authenticated
  using (
    public.current_role() = 'admin'
    or (
      active
      and available_at <= now()
      and exists (
        select 1
        from public.formula_permissions fp
        where fp.offer = any(public.current_offers())
          and fp.parcours_major
      )
    )
  );

drop policy if exists major_parcours_questions_read on public.major_parcours_questions;
create policy major_parcours_questions_read on public.major_parcours_questions
  for select to authenticated
  using (exists (
    select 1
    from public.major_parcours p
    where p.id = major_parcours_questions.parcours_id
      and (
        public.current_role() = 'admin'
        or (
          p.active
          and p.available_at <= now()
          and exists (
            select 1
            from public.formula_permissions fp
            where fp.offer = any(public.current_offers())
              and fp.parcours_major
          )
        )
      )
  ));

comment on column public.formula_permissions.parcours_major is
  'Autorise l''accès élève au module Parcours du Major pour cette formule.';
