-- Renomme chaque item « Révisions » en « Révisions - <nom de la matière> »
-- et adapte la RLS de voie externe (exception « Révisions ») pour matcher le
-- nouveau libellé via LIKE.

update public.cours c set titre = 'Révisions - ' || m.nom
from public.matieres m
where c.matiere_id = m.id and c.titre = 'Révisions';

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
        when (select p.permission_scope->>'paid_voie' from public.profiles p where p.id = auth.uid()) = 'interne'
          then coalesce(qcm_series.kind, 'qcm') <> 'qroc'
        when (select p.permission_scope->>'paid_voie' from public.profiles p where p.id = auth.uid()) = 'externe'
          then (
            coalesce(qcm_series.kind, 'qcm') = 'qroc'
            or (select c.titre from public.cours c where c.id = qcm_series.cours_id) like 'Révisions%'
          )
        else true
      end
    )
  );
