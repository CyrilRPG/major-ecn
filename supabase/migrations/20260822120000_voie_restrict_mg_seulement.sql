-- ============================================================================
-- ANNALES EVC : la restriction par voie ne doit s'appliquer qu'à la Médecine
-- générale, comme le fait déjà son miroir applicatif.
--
-- CONSTAT. `canStudentReadSerie()` (src/lib/data/qcm-access-rules.ts:160) ne
-- filtre par voie que si `serie.mg_series = true`. La policy RLS, elle, filtre
-- TOUTE série `type = 'qcm'`, quel que soit le collège (dernière définition :
-- 20260803120000_rls_perf_contenu.sql). Application et base ne disent donc pas
-- la même chose, et c'est la base qui tranche.
--
-- CONSÉQUENCE MESURÉE. Les annales EVC des collèges de spécialité sont, par
-- fidélité au sujet officiel, presque toutes des QROC : 282 des 284 séries
-- « Annales - … » publiées ont `kind = 'qroc'`. La branche « interne » de la
-- policy (`kind <> 'qroc'`) les masque donc intégralement aux 321 élèves de
-- voie interne, soit 53 % des 605 élèves — alors que ces annales ne relèvent
-- pas du tout du partage interne/externe, qui n'a de sens que sur les items de
-- Médecine générale.
--
-- CORRECTIF. Ajout de la garde `mg_series` — et seulement elle. Le reste de la
-- policy est repris à l'identique de 20260803120000 (enveloppes `(select …)`
-- pour l'évaluation unique, exemption des entraînements, exemption du staff et
-- des séances prof `type <> 'qcm'`).
--
-- Miroir applicatif : src/lib/data/qcm-access-rules.ts
-- ============================================================================

drop policy if exists qcm_series_voie_restrict on public.qcm_series;

create policy qcm_series_voie_restrict on public.qcm_series
  as restrictive
  for select
  using (
    (select public."current_role"()) is distinct from 'student'
    or type is distinct from 'qcm'
    or label ~* 'entra[iî]nement'
    -- La voie de concours ne trie que les items de Médecine générale.
    or coalesce(mg_series, false) is not true
    or case (select public.current_voie())
         when 'interne' then coalesce(kind, 'qcm') <> 'qroc'
         when 'externe' then coalesce(kind, 'qcm') = 'qroc'
         else true
       end
  );
