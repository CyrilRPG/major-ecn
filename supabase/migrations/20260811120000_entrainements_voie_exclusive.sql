-- Entraînements : une série appartient désormais à une seule voie.
-- Les QCM sont réservés à la voie interne ; les QROC à la voie externe.
-- La règle est volontairement limitée aux libellés « Entraînement » afin de
-- préserver le comportement des autres catégories de contenus.

alter table public.qcm_series
  add column if not exists allowed_voies text[],
  add column if not exists allowed_offers text[];

alter table public.qcm_series
  drop constraint if exists qcm_series_allowed_voies_check;
alter table public.qcm_series
  add constraint qcm_series_allowed_voies_check
  check (allowed_voies is null or allowed_voies <@ array['interne', 'externe']::text[]);

alter table public.qcm_series
  drop constraint if exists qcm_series_allowed_offers_check;
alter table public.qcm_series
  add constraint qcm_series_allowed_offers_check
  check (allowed_offers is null or allowed_offers <@ array['decouverte', 'essentiel', 'intensif', 'approfondi']::text[]);

create or replace function public.current_offers() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(array(
      select jsonb_array_elements_text(coalesce(p.permission_scope->'offers', '[]'::jsonb))
    ), array[]::text[]),
    array[coalesce(p.permission_scope->>'offer', 'decouverte')]
  )
  from public.profiles p where p.id = auth.uid()
$$;

-- Ne pas interroger qcm_questions directement depuis la policy qcm_series :
-- la policy de qcm_questions vérifie elle-même sa série parente et PostgreSQL
-- détecte alors une récursion infinie (42P17). La fonction SECURITY DEFINER
-- effectue cette classification hors RLS, sans exposer le contenu des questions.
create or replace function public.qcm_series_default_allowed_voies(p_serie_id uuid)
returns text[]
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select case
    when exists (
      select 1 from public.qcm_questions q
      where q.serie_id = p_serie_id and q.format = 'qcm'
    ) then array['interne']::text[]
    when exists (
      select 1 from public.qcm_questions q
      where q.serie_id = p_serie_id and q.format = 'qroc'
    ) then array['externe']::text[]
    else array['interne']::text[]
  end
$$;

revoke all on function public.qcm_series_default_allowed_voies(uuid) from public;
grant execute on function public.qcm_series_default_allowed_voies(uuid) to anon, authenticated;

drop policy if exists qcm_series_entrainement_voie_restrict on public.qcm_series;
create policy qcm_series_entrainement_voie_restrict
  on public.qcm_series
  as restrictive for select to public
  using (
    public.current_role() is distinct from 'student'
    or label !~* 'entra[iî]nement'
    or (
      public.current_voie() = any(coalesce(
        allowed_voies,
        public.qcm_series_default_allowed_voies(qcm_series.id)
      ))
      and (allowed_offers is null or allowed_offers && public.current_offers())
    )
  );
