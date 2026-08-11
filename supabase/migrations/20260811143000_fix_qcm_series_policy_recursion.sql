-- Correctif pour les environnements où la migration
-- 20260811120000_entrainements_voie_exclusive.sql a déjà été appliquée.
--
-- La policy restrictive de qcm_series consultait qcm_questions, dont la policy
-- remonte à qcm_series. Toute lecture d'un item échouait alors avec 42P17 et la
-- page Next.js transformait cette erreur en 404.

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
