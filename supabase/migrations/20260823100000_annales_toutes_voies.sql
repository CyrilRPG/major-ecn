-- ============================================================================
-- ANNALES EVC : accessibles aux deux voies, sans distinction.
--
-- CONSTAT. `qcm_series_voie_restrict` trie TOUTE série `type = 'qcm'` par la
-- voie de l'élève : voie interne → `kind <> 'qroc'`, voie externe →
-- `kind = 'qroc'` (dernière définition : 20260803120000_rls_perf_contenu.sql).
-- Or les annales EVC sont, par fidélité au sujet officiel, presque toutes des
-- QROC : 282 des 284 séries « Annales - … » ont `kind = 'qroc'`. La branche
-- « interne » les masquait donc intégralement aux 321 élèves de voie interne,
-- soit 53 % des 605 élèves.
--
-- DÉCISION. Une annale est le sujet officiel d'une session : elle n'appartient
-- à aucune voie. Le partage interne/externe garde son sens sur les banques
-- maison de Médecine générale, pas sur les annales. Deux gardes sont donc
-- ajoutées à la policy :
--
--   1. `label !~* '^annales?\y'` — les annales échappent à la règle, quel que
--      soit leur `kind` et quel que soit leur collège ;
--   2. `coalesce(mg_series, false) is not true` — la voie ne trie que les items
--      de Médecine générale, comme le fait depuis toujours le miroir applicatif
--      `canStudentReadSerie()` (src/lib/data/qcm-access-rules.ts). Sans elle,
--      la règle s'appliquait aussi aux collèges de spécialité, où elle n'a
--      aucun sens.
--
-- La garde 2 reprend 20260822120000_voie_restrict_mg_seulement.sql ; cette
-- migration redéfinit la policy en entier et est donc idempotente, que la
-- précédente ait été appliquée ou non. Le reste est repris à l'identique de
-- 20260803120000 (enveloppes `(select …)` pour l'évaluation unique, exemption
-- des entraînements, exemption du staff et des séances prof `type <> 'qcm'`).
--
-- Conséquence sur les séries à formats mixtes : une annale peut désormais
-- mélanger QCM et questions rédactionnelles dans l'ordre du sujet officiel
-- (l'EVCP 2019 de Médecine générale le fait au sein d'un même sujet). Son
-- `kind` vaudra 'qroc' du fait du trigger, sans que cela ne restreigne plus
-- rien.
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
    -- Les annales EVC ne relèvent d'aucune voie : le sujet officiel est unique.
    or label ~* '^annales?\y'
    -- La voie de concours ne trie que les items de Médecine générale.
    or coalesce(mg_series, false) is not true
    or case (select public.current_voie())
         when 'interne' then coalesce(kind, 'qcm') <> 'qroc'
         when 'externe' then coalesce(kind, 'qcm') = 'qroc'
         else true
       end
  );
