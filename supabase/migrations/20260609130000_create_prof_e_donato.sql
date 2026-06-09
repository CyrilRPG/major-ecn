-- =============================================================================
-- Migration : Création du compte professeur E. DONATO
--   • Email générique : e.donato@major-ecn.fr (à mettre à jour avec le vrai
--     email quand connu)
--   • Rôle : professor
--   • Scope : Médecine générale (Voie interne + Voie externe) — Gynécologie
--   • Permissions : QCM rw, Fiches rw, Flashcards rw, Vidéos none
--
-- NOTE : cette migration crée le user auth + profile avec un mot de passe
-- temporaire chiffré. L'enseignante devra réinitialiser son mot de passe au
-- premier login via /auth/setup-password (utiliser la fonctionnalité « mot
-- de passe oublié » ou la fonction admin reset password depuis le dashboard
-- Supabase).
-- =============================================================================

create extension if not exists "pgcrypto";

-- 0) Étendre le CHECK constraint sur profiles.role pour autoriser 'professor'
--    (le schéma initial n'accepte que 'student'/'admin').
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student','professor','admin'));

do $$
declare
  v_user_id uuid;
  v_email text := 'e.donato@major-ecn.fr';
  v_first_name text := 'E.';
  v_last_name text := 'DONATO';
  v_mg_interne_id text;
  v_mg_externe_id text;
  v_colleges text[];
  v_gyneco_cours_ids uuid[];
  v_scope jsonb;
begin
  -- 1) Récupérer les IDs des collèges Médecine générale (interne + externe)
  select id into v_mg_interne_id
    from public.matieres
   where nom = 'Médecine générale - Voie interne'
   limit 1;

  select id into v_mg_externe_id
    from public.matieres
   where nom = 'Médecine générale - Voie externe'
   limit 1;

  v_colleges := array_remove(array[v_mg_interne_id, v_mg_externe_id], null);

  -- 2) Récupérer tous les cours de gynécologie dans ces collèges
  select array_agg(c.id) into v_gyneco_cours_ids
    from public.cours c
   where c.matiere_id = any(v_colleges)
     and (lower(c.titre) like '%gyn%cologie%'
          or lower(c.titre) like '%gyneco%');

  if v_gyneco_cours_ids is null then
    v_gyneco_cours_ids := array[]::uuid[];
    raise notice 'Aucun cours gynécologie trouvé. Le compte sera créé sans restriction de cours — l''enseignante aura accès à TOUS les cours de Médecine générale. Pense à restreindre via l''interface admin une fois le cours gynécologie créé.';
  end if;

  -- 3) Construire le scope de permission
  v_scope := jsonb_build_object(
    'role', 'professor',
    'type', 'college',
    'colleges', to_jsonb(v_colleges),
    'content_permissions', jsonb_build_object(
      'qcm', 'rw',
      'fiche', 'rw',
      'flashcards', 'rw',
      'video', 'none',
      'annale', 'rw'
    )
  );

  -- N'ajoute la restriction de cours QUE si on a trouvé des cours gynéco
  if array_length(v_gyneco_cours_ids, 1) > 0 then
    v_scope := v_scope || jsonb_build_object('cours', to_jsonb(v_gyneco_cours_ids));
  end if;

  -- 4) Vérifier si l'utilisateur existe déjà (réexécution idempotente)
  select id into v_user_id from auth.users where email = v_email limit 1;

  if v_user_id is null then
    -- Créer le user dans auth.users avec un mot de passe temporaire
    v_user_id := gen_random_uuid();
    insert into auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
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
      now(),
      now(),
      '', '', '', ''
    );

    -- Ajouter une identité email (requis par GoTrue pour login email/password)
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      provider,
      identity_data,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      v_user_id,
      v_user_id::text,
      'email',
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      now(),
      now(),
      now()
    );
  end if;

  -- 5) Upsert du profil avec rôle professor + scope
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

  raise notice 'Compte E. DONATO prêt — user_id: %, scope: %', v_user_id, v_scope;
  raise notice 'Mot de passe temporaire : ChangeMeAtFirstLogin!2026 (À RESET au 1er login)';
end $$;

-- =============================================================================
-- VÉRIFICATION (à exécuter manuellement après application) :
--   select id, email, role, permission_scope
--     from public.profiles
--    where email = 'e.donato@major-ecn.fr';
--
-- ROLLBACK (manuel) :
--   delete from auth.identities where user_id = (
--     select id from auth.users where email = 'e.donato@major-ecn.fr');
--   delete from public.profiles where email = 'e.donato@major-ecn.fr';
--   delete from auth.users where email = 'e.donato@major-ecn.fr';
-- =============================================================================
