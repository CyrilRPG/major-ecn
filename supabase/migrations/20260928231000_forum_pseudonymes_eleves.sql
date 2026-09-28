-- =============================================================================
-- Migration : jamais le nom réel d'un élève sur le forum
-- =============================================================================
-- Contexte (revue du 28/09/2026) : la page /suppression-compte promet que les
-- messages du forum restent visibles « sans votre nom ni votre pseudo ».
--   • Les routes de suppression écrivent désormais « Ancien élève » dans
--     forum_questions.student_pseudo et forum_replies.author_name
--     (src/lib/forum/anonymiser.ts) AVANT de supprimer le compte.
--   • D'anciennes versions de l'app (et la relance web d'un élève sans pseudo)
--     publiaient le vrai « Prénom Nom » : rattrapage (§2) + trigger (§3).
--
-- Idempotente : `drop not null`, `create or replace`, `drop trigger if exists`,
-- et le rattrapage ne touche que les lignes encore nominatives.
--
-- Comptage fait avant écriture (lecture seule, 28/09/2026) :
--   forum_questions nominatives : 0 / 34
--   forum_replies d'élève nominatives : 5 / 5
--
--   select
--     (select count(*) from public.forum_questions q
--        join public.profiles p on p.id = q.student_id
--       where p.role = 'student'
--         and public.forum_pseudo_si_nom_reel(q.student_id, q.student_pseudo) is distinct from q.student_pseudo
--     ) as questions_nominatives,
--     (select count(*) from public.forum_replies r
--        join public.profiles p on p.id = r.author_id
--       where r.author_role = 'student' and p.role = 'student'
--         and public.forum_pseudo_si_nom_reel(r.author_id, r.author_name) is distinct from r.author_name
--     ) as relances_nominatives;
--   (requête équivalente sans la fonction, avant application :
--    lower(trim(q.student_pseudo)) = lower(trim(coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,''))))
-- =============================================================================

-- §1. La clé étrangère forum_questions.student_id est `ON DELETE SET NULL`
-- (20260614150000) mais la colonne était restée NOT NULL : supprimer le compte
-- d'un élève ayant posé une question échouait (23502 dans la cascade).
alter table public.forum_questions alter column student_id drop not null;

-- §2. Nom affichable d'un élève : renvoie `affiche` s'il n'est PAS son nom
-- réel ; sinon (nom réel, nom inversé, e-mail ou vide) son pseudo de profil,
-- ou à défaut un pseudo stable dérivé de son identifiant (« eleve-3fa2c1 »).
-- Les comptes non élèves (enseignants, admin) sont laissés tels quels.
create or replace function public.forum_pseudo_si_nom_reel(p_user uuid, affiche text)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  p record;
  a text := lower(trim(coalesce(affiche, '')));
  nom text;
  nom_inverse text;
  remplacement text;
begin
  if p_user is null then
    return affiche;
  end if;
  select role, pseudo, first_name, last_name, email
    into p
    from public.profiles
   where id = p_user;
  if not found or p.role is distinct from 'student' then
    return affiche;
  end if;

  nom := lower(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')));
  nom_inverse := lower(trim(coalesce(p.last_name, '') || ' ' || coalesce(p.first_name, '')));

  if a <> ''
     and (nom = '' or a <> nom)
     and (nom_inverse = '' or a <> nom_inverse)
     and (p.email is null or a <> lower(trim(p.email))) then
    return affiche; -- déjà un pseudo : compatibilité web (qui envoie un pseudo)
  end if;

  remplacement := nullif(trim(coalesce(p.pseudo, '')), '');
  if remplacement is null or lower(remplacement) in (nom, nom_inverse) then
    remplacement := 'eleve-' || substr(md5(p_user::text), 1, 6);
  end if;
  return remplacement;
end;
$$;

comment on function public.forum_pseudo_si_nom_reel(uuid, text) is
  'Forum : remplace le nom réel (ou e-mail) d''un élève par son pseudo. Utilisée par les triggers forum_*_pseudo_eleve.';

-- Pas d'appel direct depuis l'API : la fonction permettrait de tester si un
-- nom correspond à un identifiant.
revoke all on function public.forum_pseudo_si_nom_reel(uuid, text) from public, anon, authenticated;

-- §3. Rattrapage des messages déjà publiés sous le nom réel.
update public.forum_questions q
   set student_pseudo = public.forum_pseudo_si_nom_reel(q.student_id, q.student_pseudo)
 where q.student_id is not null
   and public.forum_pseudo_si_nom_reel(q.student_id, q.student_pseudo) is distinct from q.student_pseudo;

update public.forum_replies r
   set author_name = public.forum_pseudo_si_nom_reel(r.author_id, r.author_name)
 where r.author_role = 'student'
   and r.author_id is not null
   and public.forum_pseudo_si_nom_reel(r.author_id, r.author_name) is distinct from r.author_name;

-- §4. Triggers BEFORE INSERT : un élève qui envoie son nom réel (ancienne app,
-- relance web sans pseudo) est publié sous son pseudo. SECURITY DEFINER pour
-- lire le profil quel que soit le client (RLS) ; search_path figé.
create or replace function public.forum_questions_pseudo_eleve()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.student_pseudo := public.forum_pseudo_si_nom_reel(new.student_id, new.student_pseudo);
  return new;
end;
$$;

drop trigger if exists forum_questions_pseudo_eleve on public.forum_questions;
create trigger forum_questions_pseudo_eleve
  before insert on public.forum_questions
  for each row execute function public.forum_questions_pseudo_eleve();

create or replace function public.forum_replies_pseudo_eleve()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_role = 'student' then
    new.author_name := public.forum_pseudo_si_nom_reel(new.author_id, new.author_name);
  end if;
  return new;
end;
$$;

drop trigger if exists forum_replies_pseudo_eleve on public.forum_replies;
create trigger forum_replies_pseudo_eleve
  before insert on public.forum_replies
  for each row execute function public.forum_replies_pseudo_eleve();

revoke all on function public.forum_questions_pseudo_eleve() from public, anon, authenticated;
revoke all on function public.forum_replies_pseudo_eleve() from public, anon, authenticated;
