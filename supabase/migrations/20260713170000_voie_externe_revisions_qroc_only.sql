-- T4 : la voie EXTERNE ne voit plus QUE les séries QROC (y compris sur les cours
-- « Révisions »). On retire « OR is_revisions » de la branche externe : les QCM/DP
-- des cours de révisions deviennent réservés à la voie interne. Les séances prof
-- (type <> 'qcm') restent visibles (exemptées en amont, gate réel = access.seanceProf).
drop policy if exists qcm_series_voie_restrict on public.qcm_series;

create policy qcm_series_voie_restrict
  on public.qcm_series
  as restrictive
  for select
  to public
  using (
    ("current_role"() is distinct from 'student')
    or (type is distinct from 'qcm')
    or case current_voie()
        when 'interne' then (coalesce(kind, 'qcm') <> 'qroc')
        when 'externe' then (coalesce(kind, 'qcm') = 'qroc')
        else true
      end
  );
