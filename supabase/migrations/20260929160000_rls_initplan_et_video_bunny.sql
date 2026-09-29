-- Audit de lenteur (29/09/2026), suite.
--
-- 1. RLS : toutes les fonctions appelées « nues » dans une policy (current_role,
--    auth.uid, is_staff, current_faculte, current_offers, …) sont enveloppées
--    dans `(select …)`, qui les évalue UNE fois par requête (InitPlan) au lieu
--    d'une fois par ligne. Même correctif que les policies Gériatrie de
--    qcm_series (migration 20260929140000), appliqué aux 72 policies restantes.
--    Exception : un argument de ANY(…)/ALL(…) reste nu (enveloppé, il serait lu
--    comme une sous-requête). Généré par tmp/perf-audit-20260929/wrap-policies.cjs ;
--    vérifié par empreinte des lignes visibles de 7 comptes (élèves, élève
--    Gériatrie, professeur, admin) sur les 53 tables concernées : identique.
--
-- 2. navigator_contenus_cours : une vidéo Bunny compte comme une vidéo. Seules
--    les vidéos-fichiers (storage_path) comptaient, et il n'y en a plus aucune :
--    la palette de commandes ne proposait jamais « Vidéo · <item> ».

begin;

alter policy "forum_answers_delete" on public."forum_answers" using ((select is_staff()));
alter policy "forum_answers_insert" on public."forum_answers" with check ((select is_staff()));
alter policy "forum_answers_select" on public."forum_answers" using (((select is_staff()) OR (EXISTS ( SELECT 1
   FROM forum_questions q
  WHERE ((q.id = forum_answers.question_id) AND (q.is_public OR (q.student_id = ( SELECT auth.uid() AS uid))))))));
alter policy "forum_questions_delete" on public."forum_questions" using ((select is_staff()));
alter policy "forum_questions_select" on public."forum_questions" using ((is_public OR (student_id = ( SELECT auth.uid() AS uid)) OR (select is_staff())));
alter policy "forum_questions_update" on public."forum_questions" using ((select is_staff())) with check ((select is_staff()));
alter policy "sf_select_active" on public."satisfaction_forms" using (((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = ( SELECT auth.uid() AS uid)) AND (p.role = 'admin'::text)))) OR ((active = true) AND (faculte_id = (select current_faculte())))));
alter policy "homepage_announcements_read" on public."homepage_announcements" using (((( SELECT "current_role"() AS "current_role") = 'admin'::text) OR ((visible = true) AND (faculte_id = (select current_faculte())))));
alter policy "platform_events_read" on public."platform_events" using (((( SELECT "current_role"() AS "current_role") = 'admin'::text) OR (faculte_id = (select current_faculte()))));
alter policy "mock_exams_read_published" on public."mock_exams" using (((status = 'published'::text) AND (faculte_id = (select current_faculte()))));
alter policy "welcome_popups_read" on public."welcome_popups" using (((( SELECT "current_role"() AS "current_role") = 'admin'::text) OR (faculte_id = (select current_faculte()))));
alter policy "major_parcours_questions_admin" on public."major_parcours_questions" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "major_parcours_questions_read" on public."major_parcours_questions" using ((EXISTS ( SELECT 1
   FROM major_parcours p
  WHERE ((p.id = major_parcours_questions.parcours_id) AND (((select "current_role"()) = 'admin'::text) OR (p.active AND (p.available_at <= now()) AND (select current_has_medecine_generale()) AND (EXISTS ( SELECT 1
           FROM formula_permissions fp
          WHERE ((fp.offer = ANY (current_offers())) AND fp.parcours_major)))))))));
alter policy "major_parcours_completions_own" on public."major_parcours_completions" using (((user_id = (select auth.uid())) OR ((select "current_role"()) = ANY (ARRAY['admin'::text, 'professor'::text])))) with check ((user_id = (select auth.uid())));
alter policy "admin_all" on public."homepage_generic_data" using (((select "current_role"()) = 'admin'::text));
alter policy "major_parcours_admin" on public."major_parcours" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "major_parcours_read" on public."major_parcours" using ((((select "current_role"()) = 'admin'::text) OR (active AND (available_at <= now()) AND (faculte_id = (select current_faculte())) AND (select current_has_medecine_generale()) AND (EXISTS ( SELECT 1
   FROM formula_permissions fp
  WHERE ((fp.offer = ANY (current_offers())) AND (fp.faculte_id = (select current_faculte())) AND fp.parcours_major))))));
alter policy "exercise_imports_admin_all" on public."exercise_imports" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_tournaments_admin_all" on public."arena_tournaments" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_participants_admin_all" on public."arena_participants" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_rounds_admin_all" on public."arena_rounds" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_bareme_templates_admin_all" on public."arena_bareme_templates" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_attempts_admin_all" on public."arena_attempts" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_answers_admin_all" on public."arena_answers" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_reports_admin_all" on public."arena_reports" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_emails_admin_all" on public."arena_emails" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_log_admin_all" on public."arena_log" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_questions_admin_all" on public."arena_questions" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_staff_roles_admin_all" on public."suivi_staff_roles" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_campaigns_admin_all" on public."suivi_campaigns" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_campaign_members_admin_all" on public."suivi_campaign_members" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_slots_admin_all" on public."suivi_slots" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_appointments_admin_all" on public."suivi_appointments" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_appointments_self_read" on public."suivi_appointments" using ((user_id = (select auth.uid())));
alter policy "suivi_reports_admin_all" on public."suivi_reports" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_difficulties_admin_all" on public."suivi_difficulties" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_actions_admin_all" on public."suivi_actions" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_alerts_admin_all" on public."suivi_alerts" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_email_templates_admin_all" on public."suivi_email_templates" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_history_admin_all" on public."suivi_history" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "suivi_booking_tokens_admin_all" on public."suivi_booking_tokens" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "arena_news_leads_admin_all" on public."arena_news_leads" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "client_errors_admin_read" on public."client_errors" using ((EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = (select auth.uid())) AND (p.role = 'admin'::text)))));
alter policy "suivi_settings_admin_all" on public."suivi_settings" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_settings_admin_all" on public."plan_settings" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_settings_auth_read" on public."plan_settings" using (((select auth.uid()) IS NOT NULL));
alter policy "plan_prerequisites_admin_all" on public."plan_prerequisites" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_prerequisites_auth_read" on public."plan_prerequisites" using (((select auth.uid()) IS NOT NULL));
alter policy "plan_mastery_history_admin_all" on public."plan_mastery_history" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_mastery_history_self_read" on public."plan_mastery_history" using ((user_id = (select auth.uid())));
alter policy "plan_generations_admin_all" on public."plan_generations" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_generations_self_read" on public."plan_generations" using ((user_id = (select auth.uid())));
alter policy "plan_evaluations_admin_all" on public."plan_evaluations" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_evaluations_self_read" on public."plan_evaluations" using ((user_id = (select auth.uid())));
alter policy "plan_question_uses_admin_all" on public."plan_question_uses" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_question_uses_self_read" on public."plan_question_uses" using ((user_id = (select auth.uid())));
alter policy "plan_question_tags_admin_all" on public."plan_question_tags" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_question_tags_auth_read" on public."plan_question_tags" using (((select auth.uid()) IS NOT NULL));
alter policy "transversal_progress_self" on public."transversal_progress" using ((user_id = (select auth.uid()))) with check ((user_id = (select auth.uid())));
alter policy "plan_items_admin_all" on public."plan_items" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_items_auth_read" on public."plan_items" using (((select auth.uid()) IS NOT NULL));
alter policy "plan_sessions_admin_all" on public."plan_sessions" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_sessions_self_read" on public."plan_sessions" using ((user_id = (select auth.uid())));
alter policy "plan_activity_admin_all" on public."plan_activity" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_activity_self_read" on public."plan_activity" using ((user_id = (select auth.uid())));
alter policy "plan_mastery_admin_all" on public."plan_mastery" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_mastery_self_read" on public."plan_mastery" using ((user_id = (select auth.uid())));
alter policy "plan_profiles_admin_all" on public."plan_profiles" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_profiles_self_read" on public."plan_profiles" using ((user_id = (select auth.uid())));
alter policy "plan_matrix_versions_admin_all" on public."plan_matrix_versions" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_matrix_version_items_admin_all" on public."plan_matrix_version_items" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));
alter policy "plan_item_overlaps_admin_all" on public."plan_item_overlaps" using (((select "current_role"()) = 'admin'::text)) with check (((select "current_role"()) = 'admin'::text));

create or replace function public.navigator_contenus_cours(p_faculte_id text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  with items as (
    select c.id
    from cours c
    join matieres m on m.id = c.matiere_id
    join semestres se on se.id = m.semestre_id
    where se.faculte_id = p_faculte_id
  )
  select jsonb_build_object(
    'fiche', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from fiches f where f.cours_id = i.id and f.storage_path is not null)), '[]'::jsonb),
    'video', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from videos v where v.cours_id = i.id and (v.storage_path is not null or v.bunny_video_id is not null))), '[]'::jsonb),
    'qcm', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from qcm_series s where s.cours_id = i.id and s.type = 'qcm')), '[]'::jsonb),
    'flashcards', coalesce((select jsonb_agg(i.id) from items i where exists (select 1 from flashcards f where f.cours_id = i.id)), '[]'::jsonb)
  );
$function$;

commit;
