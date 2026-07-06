-- Généralise la distinction voie interne / externe à TOUTES les spécialités
-- (jusqu'ici limitée à Médecine générale via le drapeau mg_series).
--   interne  -> QCM + DP uniquement (jamais QROC / DP-QROC)
--   externe  -> QROC + DP-QROC (kind='qroc') + Révisions ; jamais QCM / DP
-- La policy ne s'applique qu'à role='student' + type='qcm'. Un élève sans voie
-- définie (paid_voie absent) tombe sur `else true` -> aucun filtrage ; on les
-- bascule donc explicitement en 'interne' (décision produit) juste après.

drop policy if exists qcm_series_voie_restrict on public.qcm_series;
create policy qcm_series_voie_restrict on public.qcm_series
  as restrictive for select to public
  using (
    "current_role"() is distinct from 'student'
    or type is distinct from 'qcm'
    or case public.current_voie()
         when 'interne' then coalesce(kind, 'qcm') <> 'qroc'
         when 'externe' then (coalesce(kind, 'qcm') = 'qroc' or is_revisions)
         else true
       end
  );

-- Backfill : tout élève sans voie définie -> 'interne' (voit QCM/DP comme avant,
-- aucune régression). Les nouveaux élèves auront une voie imposée à la création.
update public.profiles
set permission_scope = jsonb_set(
      coalesce(permission_scope, '{}'::jsonb), '{paid_voie}', '"interne"', true)
where role = 'student'
  and coalesce(permission_scope ->> 'paid_voie', '') = '';
