-- =============================================================================
-- Migration : Création du compte professeur G. COHEN
--   • Email générique : g.cohen@major-ecn.fr (à mettre à jour avec le vrai
--     email quand connu)
--   • Rôle : professor
--   • Scope : Hématologie + Médecine interne
--     (cherche d'abord en tant que collèges/matières ; sinon comme cours
--      à l'intérieur des collèges existants — typiquement Médecine générale
--      voie interne et voie externe).
--   • Permissions : QCM rw, Fiches rw, Flashcards rw, Annales rw, Vidéos none
-- =============================================================================

create extension if not exists "pgcrypto";

-- Étendre le CHECK constraint sur profiles.role pour autoriser 'professor'
-- (idempotent : si déjà étendu par la migration E. DONATO c'est un no-op)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student','professor','admin'));

do $$
declare
  v_user_id uuid;
  v_email text := 'g.cohen@major-ecn.fr';
  v_first_name text := 'G.';
  v_last_name text := 'COHEN';
  v_target_colleges text[] := array[]::text[];
  v_target_cours uuid[] := array[]::uuid[];
  v_scope jsonb;
begin
  -- 1) Chercher en tant que collèges (matières) — par nom contenant
  --    "hématologie" / "hematologie" ou "médecine interne" / "medecine interne"
  select coalesce(array_agg(id), array[]::text[]) into v_target_colleges
    from public.matieres
   where lower(nom) like '%h%matologie%'
      or lower(nom) like '%hematologie%'
      or lower(nom) like '%m%decine interne%'
      or lower(nom) like '%medecine interne%';

  -- 2) Chercher en tant que cours dans tous les collèges existants
  select coalesce(array_agg(id), array[]::uuid[]) into v_target_cours
    from public.cours
   where lower(titre) like '%h%matologie%'
      or lower(titre) like '%hematologie%'
      or lower(titre) like '%m%decine interne%'
      or lower(titre) like '%medecine interne%';

  -- 3) Construire le scope
  if array_length(v_target_colleges, 1) > 0 then
    -- Cas A : Hématologie / Médecine interne SONT des collèges → scope
    -- restreint à ces collèges, sans restriction de cours (accès complet)
    v_scope := jsonb_build_object(
      'role', 'professor',
      'type', 'college',
      'colleges', to_jsonb(v_target_colleges),
      'content_permissions', jsonb_build_object(
        'qcm', 'rw',
        'fiche', 'rw',
        'flashcards', 'rw',
        'video', 'none',
        'annale', 'rw'
      )
    );
    raise notice 'G. COHEN — collèges trouvés : %', v_target_colleges;

  elsif array_length(v_target_cours, 1) > 0 then
    -- Cas B : Hématologie / Médecine interne sont des cours dans d'autres
    -- collèges → on autorise tous les collèges parents + restriction par cours
    declare
      v_parent_colleges text[];
    begin
      select array_agg(distinct matiere_id) into v_parent_colleges
        from public.cours
       where id = any(v_target_cours);

      v_scope := jsonb_build_object(
        'role', 'professor',
        'type', 'college',
        'colleges', to_jsonb(v_parent_colleges),
        'cours', to_jsonb(v_target_cours),
        'content_permissions', jsonb_build_object(
          'qcm', 'rw',
          'fiche', 'rw',
          'flashcards', 'rw',
          'video', 'none',
          'annale', 'rw'
        )
      );
      raise notice 'G. COHEN — cours trouvés (collèges parents %) : %', v_parent_colleges, v_target_cours;
    end;

  else
    -- Cas C : ni collège ni cours trouvé → on crée quand même le compte
    -- avec un scope 'all' (à restreindre via l'interface admin une fois les
    -- collèges/cours créés)
    v_scope := jsonb_build_object(
      'role', 'professor',
      'type', 'all',
      'colleges', '[]'::jsonb,
      'content_permissions', jsonb_build_object(
        'qcm', 'rw',
        'fiche', 'rw',
        'flashcards', 'rw',
        'video', 'none',
        'annale', 'rw'
      )
    );
    raise warning 'G. COHEN — Aucun collège ni cours « Hématologie » / « Médecine interne » trouvé. Compte créé avec scope ''all'' temporaire. PENSE À RESTREINDRE via l''interface admin une fois ces collèges/cours créés.';
  end if;

  -- 4) Vérifier si l'utilisateur existe déjà (idempotent)
  select id into v_user_id from auth.users where email = v_email limit 1;

  if v_user_id is null then
    v_user_id := gen_random_uuid();
    insert into auth.users (
      id, instance_id, aud, role, email,
      encrypted_password, email_confirmed_at, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) values (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      v_email,
      crypt('ChangeMeAtFirstLogin!2026', gen_salt('bf')),
      now(),
      jsonb_build_object(
        'first_name', v_first_name,
        'last_name', v_last_name,
        'role', 'professor'
      ),
      now(), now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      'email',
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      now(), now(), now()
    );
  end if;

  -- 5) Upsert du profil
  insert into public.profiles (
    id, role, first_name, last_name, email, permission_scope, created_at
  ) values (
    v_user_id, 'professor', v_first_name, v_last_name, v_email, v_scope, now()
  )
  on conflict (id) do update set
    role = 'professor',
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    permission_scope = excluded.permission_scope;

  raise notice 'Compte G. COHEN prêt — user_id: %, scope: %', v_user_id, v_scope;
  raise notice 'Mot de passe temporaire : ChangeMeAtFirstLogin!2026 (À RESET au 1er login)';
end $$;

-- =============================================================================
-- VÉRIFICATION (à exécuter manuellement après application) :
--   select id, email, role, permission_scope
--     from public.profiles
--    where email = 'g.cohen@major-ecn.fr';
--
-- ROLLBACK (manuel) :
--   delete from auth.identities where user_id = (
--     select id from auth.users where email = 'g.cohen@major-ecn.fr');
--   delete from public.profiles where email = 'g.cohen@major-ecn.fr';
--   delete from auth.users where email = 'g.cohen@major-ecn.fr';
-- =============================================================================
