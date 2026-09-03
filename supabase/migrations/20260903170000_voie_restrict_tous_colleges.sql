-- ============================================================================
-- La voie de concours trie les séries dans TOUS les collèges.
--
-- CONSTAT (03/09/2026, signalé par Cyril). Une élève inscrite en voie interne
-- sur le collège Psychiatrie avait accès aux QCM **et** aux séries
-- rédactionnelles. La restriction par voie ne s'appliquait qu'aux items de
-- Médecine générale : garde `coalesce(mg_series, false) is not true`, ajoutée
-- par 20260822120000_voie_restrict_mg_seulement.sql.
--
-- POURQUOI CETTE GARDE EXISTAIT, ET POURQUOI ELLE NE SERT PLUS. Elle visait un
-- vrai problème : les annales EVC des collèges de spécialité sont presque
-- toutes des QROC (282 des 284 séries « Annales - … »), et la branche
-- « interne » les masquait intégralement. Mais le levier choisi était trop
-- large — il exemptait TOUS les collèges au lieu des seules annales. Le miroir
-- applicatif (src/lib/data/qcm-access-rules.ts) a depuis reçu une exemption
-- « annales » explicite, qui traite la cause. La garde `mg_series` est donc
-- retirée et l'exemption des annales prend sa place, ici comme côté applicatif.
--
-- L'exception « Révisions… » de la voie externe (`is_revisions`) était rejouée
-- côté applicatif mais absente de la policy : elle est ajoutée, pour qu'une
-- série listée ne puisse jamais être refusée à l'ouverture.
--
-- PORTÉE MESURÉE AVANT APPLICATION. 350 élèves en voie interne, 161 en voie
-- externe, 164 sans voie renseignée (jamais filtrés). Aucun collège ne se
-- retrouve sans aucune série pour une voie. Les collèges où la voie externe
-- perd le plus (Orthopédie 2178 → 50, Gynécologie-obstétrique 597 → 37) n'ont
-- aucun élève de voie externe inscrit ; ceux qui en ont gardent une base large
-- (Gériatrie 469 → 197 pour 22 élèves, Psychiatrie 1371 → 731 pour 14).
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
    -- Le sujet officiel d'une session n'appartient à aucune voie.
    or label ~* '^annales?\y'
    or case (select public.current_voie())
         when 'interne' then coalesce(kind, 'qcm') <> 'qroc'
         when 'externe' then coalesce(kind, 'qcm') = 'qroc' or coalesce(is_revisions, false)
         else true
       end
  );
