-- Renforce la RLS de voie : la voie de l'utilisateur est lue via une fonction
-- SECURITY DEFINER (comme current_role()) plutôt qu'une sous-requête inline sur
-- `profiles`, pour éviter toute interaction RLS lors des embeddings imbriqués
-- (cours -> qcm_series) côté PostgREST.

create or replace function public.current_voie() returns text
  language sql stable security definer set search_path to 'public' as $$
  select permission_scope->>'paid_voie' from public.profiles where id = auth.uid();
$$;

drop policy if exists qcm_series_voie_restrict on public.qcm_series;
create policy qcm_series_voie_restrict on public.qcm_series
  as restrictive for select to public
  using (
    "current_role"() is distinct from 'student'
    or type is distinct from 'qcm'
    or not exists (
      select 1 from public.cours c
      join public.matieres m on m.id = c.matiere_id
      where c.id = qcm_series.cours_id
        and (m.id = 'col-medecine-generale' or m.parent_matiere_id = 'col-medecine-generale')
    )
    or (
      case
        when public.current_voie() = 'interne' then coalesce(qcm_series.kind, 'qcm') <> 'qroc'
        when public.current_voie() = 'externe' then (
          coalesce(qcm_series.kind, 'qcm') = 'qroc'
          or (select c.titre from public.cours c where c.id = qcm_series.cours_id) like 'Révisions%'
        )
        else true
      end
    )
  );
