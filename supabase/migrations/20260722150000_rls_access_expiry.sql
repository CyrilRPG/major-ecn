-- =============================================
-- Durcissement RLS : blocage de la LECTURE du contenu à l'expiration d'accès.
--
-- Défense en profondeur pour l'app mobile qui lit le contenu en direct via RLS :
-- même si un client contourne les gardes applicatives, un étudiant expiré ne
-- peut plus lire le contenu pédagogique.
--
-- Policies RESTRICTIVES (ANDées avec les policies permissives existantes).
-- `(select public.access_expired())` est évalué une fois par requête (initplan)
-- comme dans la migration voie 20260702170000 — coût O(1).
--
-- Ne s'applique QU'aux tables de CONTENU (jamais aux tables de progression :
-- un étudiant expiré garde son historique). access_expired() renvoie false
-- pour les admins/profs et les étudiants sans session ⇒ inchangés.
-- =============================================

create policy cours_not_expired on public.cours
  as restrictive for select using (not (select public.access_expired()));

create policy matieres_not_expired on public.matieres
  as restrictive for select using (not (select public.access_expired()));

create policy semestres_not_expired on public.semestres
  as restrictive for select using (not (select public.access_expired()));

create policy fiches_not_expired on public.fiches
  as restrictive for select using (not (select public.access_expired()));

create policy videos_not_expired on public.videos
  as restrictive for select using (not (select public.access_expired()));

create policy qcm_series_not_expired on public.qcm_series
  as restrictive for select using (not (select public.access_expired()));

create policy qcm_questions_not_expired on public.qcm_questions
  as restrictive for select using (not (select public.access_expired()));

-- NB : PAS de restriction sur qcm_items. Sa policy de lecture permissive
-- comporte déjà une jointure EXISTS sur 5 tables (la plus coûteuse du schéma) ;
-- y ajouter une restriction fait dépasser le statement_timeout, même sur des
-- requêtes filtrées (confirmé en test). L'expiration reste couverte : l'app
-- lit TOUJOURS les items via leur question/série parente, elles-mêmes
-- restreintes ci-dessus — un étudiant expiré ne peut ni découvrir ni lire les
-- questions, donc ni atteindre leurs items par l'UI. Défense en profondeur, le
-- verrou principal restant applicatif (boot gate + gardes /api/mobile/*).

create policy flashcards_not_expired on public.flashcards
  as restrictive for select using (not (select public.access_expired()));
