-- Entraînements accessibles quelle que soit la voie.
--
-- La politique `qcm_series_voie_restrict` limitait la voie externe aux seules
-- séries QROC (kind = 'qroc'). Or les séries d'entraînement sont majoritairement
-- des QCM (kind = 'qcm') : elles étaient donc masquées à la voie externe.
--
-- On ajoute une exemption : toute série dont le libellé contient « entraînement »
-- (avec ou sans accent) reste visible pour toutes les voies. Le reste de la
-- restriction est inchangé (interne = QCM/DP, externe = QROC/DP-QROC).

drop policy if exists qcm_series_voie_restrict on public.qcm_series;

create policy qcm_series_voie_restrict
  on public.qcm_series
  as restrictive
  for select
  to public
  using (
    ("current_role"() is distinct from 'student')
    or (type is distinct from 'qcm')
    -- Les entraînements (le plus souvent des QCM) restent accessibles quelle que
    -- soit la voie : la voie externe doit pouvoir s'entraîner sur ces QCM.
    or (label ~* 'entra[iî]nement')
    or case current_voie()
        when 'interne' then (coalesce(kind, 'qcm') <> 'qroc')
        when 'externe' then (coalesce(kind, 'qcm') = 'qroc')
        else true
      end
  );
