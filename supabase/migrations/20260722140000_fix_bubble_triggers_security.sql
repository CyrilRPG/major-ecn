-- =============================================
-- Correctif : les triggers de propagation (content_updated_at) doivent être
-- SECURITY DEFINER.
--
-- Symptôme : auth.admin.deleteUser → « Database error deleting user »
-- (permission denied for table cours). Chaîne : DELETE auth.users → action
-- référentielle SET NULL sur fiches.updated_by → UPDATE statement sur fiches →
-- trigger fiches_bubble_upd → update public.cours exécuté sous le rôle
-- supabase_auth_admin, qui n'a aucun droit sur les tables de contenu.
--
-- Correctif : SECURITY DEFINER (owner postgres) + sortie anticipée quand la
-- transition table est vide (cas de l'action référentielle sans ligne touchée).
-- =============================================

create or replace function public.touch_serie_from_questions() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from changed) then return null; end if;
  update public.qcm_series set updated_at = now()
  where id in (select distinct serie_id from changed);
  return null;
end; $$;

create or replace function public.touch_serie_from_items() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from changed) then return null; end if;
  update public.qcm_series set updated_at = now()
  where id in (
    select distinct q.serie_id
    from changed c join public.qcm_questions q on q.id = c.question_id
  );
  return null;
end; $$;

create or replace function public.touch_cours_from_child() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from changed) then return null; end if;
  update public.cours set updated_at = now()
  where id in (select distinct cours_id from changed);
  return null;
end; $$;
