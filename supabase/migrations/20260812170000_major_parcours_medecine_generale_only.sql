-- Le Parcours du Major est réservé aux comptes réellement inscrits en
-- Médecine générale, en plus de la permission de formule existante.

create or replace function public.current_has_medecine_generale()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce((
    select case
      -- Les métadonnées d'achat font foi lorsqu'elles sont renseignées.
      when nullif(trim(p.permission_scope->>'paid_specialty'), '') is not null then
        lower(trim(p.permission_scope->>'paid_specialty')) in ('médecine générale', 'medecine generale')
      when nullif(trim(p.permission_scope->>'specialty_wish'), '') is not null then
        lower(trim(p.permission_scope->>'specialty_wish')) in ('médecine générale', 'medecine generale')
      -- Repli pour les comptes historiques. Gériatrie est exclue : son bonus
      -- ajoute des collèges MG sans transformer la spécialité de l'élève.
      else
        not coalesce(p.permission_scope->'colleges' @> '"col-geriatrie"'::jsonb, false)
        and exists (
          select 1
          from jsonb_array_elements_text(coalesce(p.permission_scope->'colleges', '[]'::jsonb)) college
          where college = 'col-medecine-generale' or college like 'col-mg-%'
        )
    end
    from public.profiles p
    where p.id = auth.uid()
  ), false);
$$;

grant execute on function public.current_has_medecine_generale() to authenticated;

drop policy if exists major_parcours_read on public.major_parcours;
create policy major_parcours_read on public.major_parcours
  for select to authenticated
  using (
    public.current_role() = 'admin'
    or (
      active
      and available_at <= now()
      and public.current_has_medecine_generale()
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
          and public.current_has_medecine_generale()
          and exists (
            select 1
            from public.formula_permissions fp
            where fp.offer = any(public.current_offers())
              and fp.parcours_major
          )
        )
      )
  ));

comment on function public.current_has_medecine_generale() is
  'Indique si le compte courant possède réellement la spécialité Médecine générale.';
