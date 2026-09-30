-- ============================================================================
-- Relances de l'Offre Découverte — cahier des charges du client (30 sections).
--
-- Détecter les candidats découverte jamais connectés, dire QUI relancer, QUAND
-- et avec QUEL modèle (R1 J+7, R2 J+21, R3 J+45, puis STOP ; campagne unique
-- « ancien accès » pour le vieux stock), envoyer SOUS CONTRÔLE ADMINISTRATEUR,
-- tracer chaque action et mesurer les premières connexions générées.
--
-- Garanties portées PAR LA BASE (et non par la seule application) :
--  • anti-doublon : index unique partiel (candidat, niveau) sur les envois
--    R1/R2/R3/ancien accès réservés, envoyés ou importés — deux
--    administrateurs qui envoient en même temps, un double clic ou une requête
--    rejouée ne peuvent pas produire deux e-mails du même niveau ;
--  • idempotence des opérations : clé fournie par le client, unique ;
--  • timeline, oppositions et journal APPEND-ONLY : triggers qui refusent
--    UPDATE et DELETE (historique non écrasable, opposition jamais levée) ;
--  • jetons d'accès : seul le hash SHA-256 est stocké, jamais le jeton ;
--  • première connexion captée par un trigger sur auth.users, ENTIÈREMENT
--    protégé (EXCEPTION WHEN OTHERS → RETURN NEW) : une erreur ici ne doit
--    jamais bloquer une connexion de la plateforme.
--
-- Additive uniquement. RLS activée sans politique : accès service-role côté
-- serveur exclusivement. Rejouable (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

-- ─────────────────────────────── Paramètres ───────────────────────────────
create table if not exists public.decouverte_parametres (
  id smallint primary key default 1 check (id = 1),
  delai_r1_jours integer not null default 7 check (delai_r1_jours between 1 and 730),
  delai_r2_jours integer not null default 21 check (delai_r2_jours between 1 and 730),
  delai_r3_jours integer not null default 45 check (delai_r3_jours between 1 and 730),
  r1_actif boolean not null default true,
  r2_actif boolean not null default true,
  r3_actif boolean not null default true,
  ancien_acces_actif boolean not null default true,
  ecart_min_jours integer not null default 7 check (ecart_min_jours between 0 and 365),
  seuil_ancien_jours integer not null default 45 check (seuil_ancien_jours between 1 and 3650),
  max_relances integer not null default 3 check (max_relances between 0 and 3),
  attribution_regle text not null default 'dernier_clic'
    check (attribution_regle in ('dernier_clic', 'derniere_relance', 'premiere_relance')),
  attribution_fenetre_jours integer not null default 14 check (attribution_fenetre_jours between 1 and 365),
  validite_lien_jours integer not null default 30 check (validite_lien_jours between 1 and 365),
  pause boolean not null default false,
  lien_video text not null default '/visite-guidee',
  -- Surcharges des modèles d'e-mail par type ({ "R1": { objet, preheader, … } }) ;
  -- les valeurs par défaut vivent dans le code (src/lib/decouverte/modeles.ts).
  modeles jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  derniere_synchro_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid,
  constraint decouverte_parametres_delais_croissants check (delai_r1_jours < delai_r2_jours and delai_r2_jours < delai_r3_jours)
);
insert into public.decouverte_parametres (id) values (1) on conflict (id) do nothing;

-- ─────────────────────────────── Candidats ───────────────────────────────
create table if not exists public.decouverte_candidats (
  id uuid primary key default gen_random_uuid(),
  faculte_id text not null default 'major-ecn',
  -- Le compte peut disparaître : l'historique reste (SET NULL, jamais CASCADE).
  user_id uuid unique references auth.users(id) on delete set null,
  email_actuel text not null,
  email_normalise text generated always as (lower(btrim(email_actuel))) stored,
  prenom text,
  nom text,
  telephone text,
  specialite text,
  voie text,
  origine text not null default 'formulaire_decouverte',
  session_evc text,
  pays text,
  demande_at timestamptz not null default now(),
  derniere_demande_at timestamptz,
  nb_demandes integer not null default 1,
  -- Demande antérieure (compte supprimé puis nouvelle inscription) : parcours rattaché.
  demande_anterieure_id uuid references public.decouverte_candidats(id),
  compte_cree_at timestamptz,
  acces_initial_at timestamptz,            -- J0 : e-mail d'activation envoyé
  acces_initial_approx boolean not null default false,
  premiere_connexion_at timestamptz,
  premiere_connexion_approx boolean not null default false,
  derniere_connexion_at timestamptz,
  compte_supprime_at timestamptz,
  relance_attribuee uuid,                  -- id d'envoi (FK posée plus bas)
  regle_attribution_appliquee text,
  attribution_calculee_at timestamptz,
  delai_connexion_sec integer,             -- relance → première connexion
  delai_clic_sec integer,                  -- relance → premier clic
  email_bloque_adresse text,               -- hard bounce : adresse bloquée (normalisée)
  email_bloque_raison text,
  email_bloque_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists decouverte_candidats_email_idx on public.decouverte_candidats (email_normalise);
create index if not exists decouverte_candidats_demande_idx on public.decouverte_candidats (demande_at);

-- ─────────────────────────────── Envois ───────────────────────────────
create table if not exists public.decouverte_envois (
  id uuid primary key default gen_random_uuid(),   -- identifiant unique d'envoi (Idempotency-Key Resend)
  candidat_id uuid references public.decouverte_candidats(id) on delete restrict,
  type text not null check (type in ('initial', 'R1', 'R2', 'R3', 'ancien_acces', 'renvoi_lien', 'ancienne_relance', 'test')),
  origine text not null check (origine in ('module', 'manuel', 'import', 'ancien_systeme', 'candidat', 'test')),
  exceptionnel boolean not null default false,
  statut text not null check (statut in ('en_cours', 'envoye', 'echec', 'historique')),
  email_utilise text,
  sujet text,
  modele_version integer,
  resend_id text,
  operation_id uuid,
  envoye_par uuid,
  envoye_par_nom text,
  commentaire text,
  html_snapshot text,                    -- version navigateur ET reprise à l'identique (même charge utile Resend)
  texte_snapshot text,
  date_approx boolean not null default false,
  created_at timestamptz not null default now(),
  envoye_at timestamptz,
  delivre_at timestamptz,
  ouvert_at timestamptz,
  nb_ouvertures integer not null default 0,
  clic_cta_at timestamptz,
  nb_clics_cta integer not null default 0,
  clic_video_at timestamptz,
  nb_clics_video integer not null default 0,
  dernier_clic_at timestamptz,
  bounce_at timestamptz,
  bounce_type text,
  plainte_at timestamptz,
  desinscrit_at timestamptz,
  erreur text,
  updated_at timestamptz not null default now()
);
-- ANTI-DOUBLON (§12, §26, §29) : un seul R1/R2/R3/ancien accès par candidat,
-- réservé, envoyé ou importé. Les relances manuelles EXCEPTIONNELLES (confirmées
-- et tracées) en sont seules exemptées ; un échec libère le niveau.
create unique index if not exists decouverte_envois_un_par_niveau
  on public.decouverte_envois (candidat_id, type)
  where type in ('R1', 'R2', 'R3', 'ancien_acces')
    and statut in ('en_cours', 'envoye', 'historique')
    and not exceptionnel;
create index if not exists decouverte_envois_candidat_idx on public.decouverte_envois (candidat_id);
create index if not exists decouverte_envois_resend_idx on public.decouverte_envois (resend_id) where resend_id is not null;
create index if not exists decouverte_envois_operation_idx on public.decouverte_envois (operation_id) where operation_id is not null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'decouverte_candidats_relance_attribuee_fkey') then
    alter table public.decouverte_candidats
      add constraint decouverte_candidats_relance_attribuee_fkey
      foreign key (relance_attribuee) references public.decouverte_envois(id);
  end if;
end $$;

-- ─────────────────────────────── Liens (jetons) ───────────────────────────────
create table if not exists public.decouverte_liens (
  id uuid primary key default gen_random_uuid(),
  jeton_hash text not null unique,          -- SHA-256 hex du jeton ; jamais le jeton en clair
  envoi_id uuid not null references public.decouverte_envois(id) on delete restrict,
  candidat_id uuid references public.decouverte_candidats(id) on delete restrict,
  expire_at timestamptz not null,           -- validité du PARCOURS D'ACCÈS (désinscription et version navigateur restent actives)
  revoque_at timestamptz,
  revoque_raison text,
  nb_acces integer not null default 0,
  dernier_usage_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists decouverte_liens_candidat_idx on public.decouverte_liens (candidat_id);

-- ─────────────────────────────── Timeline (append-only) ───────────────────────────────
create table if not exists public.decouverte_evenements (
  id bigint generated always as identity primary key,
  candidat_id uuid references public.decouverte_candidats(id) on delete restrict,
  envoi_id uuid references public.decouverte_envois(id) on delete restrict,
  type text not null,
  survenu_at timestamptz not null default now(),
  acteur_id uuid,
  acteur_nom text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists decouverte_evenements_candidat_idx on public.decouverte_evenements (candidat_id, survenu_at);

-- ─────────────────────────────── Opérations d'envoi ───────────────────────────────
create table if not exists public.decouverte_operations (
  id uuid primary key default gen_random_uuid(),
  cle_idempotence text not null unique,
  type text not null check (type in ('groupe', 'individuel', 'exceptionnel')),
  mode text not null check (mode in ('relance', 'ancien_acces', 'exceptionnel')),
  type_force text check (type_force in ('R1', 'R2', 'R3', 'ancien_acces')),
  statut text not null default 'preparee' check (statut in ('preparee', 'en_cours', 'terminee', 'annulee')),
  cree_par uuid,
  cree_par_nom text,
  commentaire text,
  total integer not null default 0,
  ventilation jsonb not null default '{}'::jsonb,
  bilan jsonb not null default '{}'::jsonb,
  confirmee_at timestamptz,
  confirmee_par uuid,
  terminee_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.decouverte_operation_items (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null references public.decouverte_operations(id) on delete restrict,
  candidat_id uuid not null references public.decouverte_candidats(id) on delete restrict,
  type_prevu text,
  statut text not null default 'a_traiter' check (statut in ('a_traiter', 'en_cours', 'envoye', 'exclu', 'echec')),
  raison text,
  envoi_id uuid references public.decouverte_envois(id),
  tentatives integer not null default 0,
  claimed_at timestamptz,
  traite_at timestamptz,
  unique (operation_id, candidat_id)
);
create index if not exists decouverte_operation_items_op_idx on public.decouverte_operation_items (operation_id, statut);

-- ─────────────────────────────── Journal (append-only) ───────────────────────────────
create table if not exists public.decouverte_journal (
  id bigint generated always as identity primary key,
  acteur_id uuid,
  acteur_nom text,
  action text not null,
  volume integer,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────── Oppositions (append-only) ───────────────────────────────
-- Respect DURABLE de l'opposition (§20) : jamais supprimée, jamais levée
-- automatiquement. Rapprochée par adresse normalisée ET par compte.
create table if not exists public.communication_oppositions (
  id uuid primary key default gen_random_uuid(),
  faculte_id text not null default 'major-ecn',
  email_normalise text not null check (email_normalise = lower(btrim(email_normalise)) and email_normalise <> ''),
  user_id uuid,
  candidat_id uuid references public.decouverte_candidats(id) on delete restrict,
  portee text not null default 'prospection' check (portee in ('prospection')),
  source text not null check (source in ('lien_desinscription', 'one_click', 'plainte', 'admin', 'campagne')),
  envoi_id uuid references public.decouverte_envois(id),
  commentaire text,
  cree_par uuid,
  created_at timestamptz not null default now(),
  unique (faculte_id, email_normalise, portee)
);
create index if not exists communication_oppositions_user_idx on public.communication_oppositions (user_id) where user_id is not null;

-- ─────────────────────────────── RLS ───────────────────────────────
alter table public.decouverte_parametres enable row level security;
alter table public.decouverte_candidats enable row level security;
alter table public.decouverte_envois enable row level security;
alter table public.decouverte_liens enable row level security;
alter table public.decouverte_evenements enable row level security;
alter table public.decouverte_operations enable row level security;
alter table public.decouverte_operation_items enable row level security;
alter table public.decouverte_journal enable row level security;
alter table public.communication_oppositions enable row level security;

-- ─────────────────────────────── Append-only ───────────────────────────────
create or replace function public.decouverte_refuser_modification()
returns trigger language plpgsql as $$
begin
  raise exception 'Table % en ajout seul : % refusé (historique non écrasable)', tg_table_name, tg_op
    using errcode = '42501';
end $$;

drop trigger if exists decouverte_evenements_append_only on public.decouverte_evenements;
create trigger decouverte_evenements_append_only before update or delete on public.decouverte_evenements
  for each row execute function public.decouverte_refuser_modification();
drop trigger if exists decouverte_evenements_no_truncate on public.decouverte_evenements;
create trigger decouverte_evenements_no_truncate before truncate on public.decouverte_evenements
  for each statement execute function public.decouverte_refuser_modification();

drop trigger if exists decouverte_journal_append_only on public.decouverte_journal;
create trigger decouverte_journal_append_only before update or delete on public.decouverte_journal
  for each row execute function public.decouverte_refuser_modification();
drop trigger if exists decouverte_journal_no_truncate on public.decouverte_journal;
create trigger decouverte_journal_no_truncate before truncate on public.decouverte_journal
  for each statement execute function public.decouverte_refuser_modification();

drop trigger if exists communication_oppositions_append_only on public.communication_oppositions;
create trigger communication_oppositions_append_only before update or delete on public.communication_oppositions
  for each row execute function public.decouverte_refuser_modification();
drop trigger if exists communication_oppositions_no_truncate on public.communication_oppositions;
create trigger communication_oppositions_no_truncate before truncate on public.communication_oppositions
  for each statement execute function public.decouverte_refuser_modification();

-- ─────────────────────────────── Compte supprimé ───────────────────────────────
-- La suppression d'un compte Auth passe user_id à NULL (FK SET NULL) : on date
-- la suppression et on la trace. Protégé : une erreur ici ne doit jamais
-- empêcher GoTrue de supprimer un compte.
create or replace function public.decouverte_compte_supprime()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  begin
    if old.user_id is not null and new.user_id is null then
      new.compte_supprime_at := coalesce(new.compte_supprime_at, now());
      insert into public.decouverte_evenements (candidat_id, type, details)
      values (new.id, 'compte_supprime', jsonb_build_object('ancien_user_id', old.user_id));
    end if;
  exception when others then
    return new;
  end;
  return new;
end $$;
drop trigger if exists decouverte_candidats_compte_supprime on public.decouverte_candidats;
create trigger decouverte_candidats_compte_supprime before update of user_id on public.decouverte_candidats
  for each row execute function public.decouverte_compte_supprime();

-- ─────────────────────────────── Première connexion ───────────────────────────────
-- ⚠️ Trigger sur auth.users : TOUT est enveloppé dans BEGIN … EXCEPTION WHEN
-- OTHERS THEN RETURN NEW. Une erreur non rattrapée ici ferait échouer la mise à
-- jour de last_sign_in_at, donc TOUTES les connexions de la plateforme.
-- Ne se déclenche qu'au passage NULL → non NULL (première connexion du compte).
create or replace function public.decouverte_premiere_connexion()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  begin
    update public.decouverte_candidats c
       set premiere_connexion_at = new.last_sign_in_at,
           premiere_connexion_approx = false,
           derniere_connexion_at = new.last_sign_in_at,
           updated_at = now()
     where c.user_id = new.id
       and c.premiere_connexion_at is null
    returning c.id into v_id;
    if v_id is not null then
      insert into public.decouverte_evenements (candidat_id, type, survenu_at, details)
      values (v_id, 'premiere_connexion', new.last_sign_in_at, jsonb_build_object('source', 'connexion'));
    end if;
  exception when others then
    return new;
  end;
  return new;
end $$;
revoke all on function public.decouverte_premiere_connexion() from public, anon, authenticated;

drop trigger if exists decouverte_premiere_connexion on auth.users;
create trigger decouverte_premiere_connexion
  after update of last_sign_in_at on auth.users
  for each row
  when (old.last_sign_in_at is null and new.last_sign_in_at is not null)
  execute function public.decouverte_premiere_connexion();

-- ─────────────────────────────── Synchronisation ───────────────────────────────
-- Rattrapage idempotent, 100 % SQL (aucun plafond PostgREST) :
--  1. fiches des profils découverte qui n'en ont pas (stock existant, échec
--     d'inscription) + événements de reprise + e-mail initial « historique » ;
--  2. dernière relance de l'ancien cron automatique (profiles.last_relance_at)
--     reprise en envoi « historique » (seule la plus récente est connue) ;
--  3. premières connexions manquées (date approchée : plus ancienne trace
--     connue — confirmation d'adresse, session la plus ancienne, dernière
--     connexion ; auth.audit_log_entries est vide sur ce projet) ;
--  4. dernière connexion, identité, changement d'adresse (historisé, liens
--     d'accès révoqués, blocage de bounce levé si l'adresse a changé).
create or replace function public.decouverte_synchroniser()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_nouveaux integer := 0;
  v_hist integer := 0;
  v_connexions integer := 0;
  v_emails integer := 0;
begin
  -- 1. Nouveaux candidats
  with src as (
    select p.id as user_id,
           coalesce(nullif(btrim(u.email), ''), p.email) as email,
           p.first_name, p.last_name, p.phone,
           coalesce(nullif(p.permission_scope->'signup'->>'specialty', ''), p.permission_scope->>'specialty_wish') as specialite,
           coalesce(nullif(p.permission_scope->>'voie', ''), p.permission_scope->'signup'->>'voie') as voie,
           p.permission_scope->'signup'->>'session' as session_evc,
           p.permission_scope->'signup'->>'country' as pays,
           coalesce(p.created_at, u.created_at) as demande_at,
           u.created_at as compte_cree_at,
           -- J0 = création du compte (l'e-mail d'activation part dans la foulée). JAMAIS
           -- invited_at : l'ancien cron de relance régénérait une invitation tous les
           -- 7 jours, invited_at porte donc la date de la DERNIÈRE relance.
           coalesce(u.created_at, p.created_at) as acces_initial_at
      from public.profiles p
      join auth.users u on u.id = p.id
     where p.faculte_id = 'major-ecn'
       and p.role = 'student'
       and (p.permission_scope->>'espace_decouverte') = 'true'
       and coalesce(nullif(btrim(u.email), ''), p.email) is not null
       and not exists (select 1 from public.decouverte_candidats c where c.user_id = p.id)
  ), ins as (
    insert into public.decouverte_candidats
      (user_id, email_actuel, prenom, nom, telephone, specialite, voie, origine, session_evc, pays,
       demande_at, compte_cree_at, acces_initial_at, acces_initial_approx)
    select user_id, email, first_name, last_name, phone, specialite, voie, 'formulaire_decouverte', session_evc, pays,
           demande_at, compte_cree_at, acces_initial_at, true
      from src
    on conflict (user_id) do nothing
    returning id, email_actuel, demande_at, compte_cree_at, acces_initial_at
  ), env as (
    insert into public.decouverte_envois (candidat_id, type, origine, statut, email_utilise, sujet, commentaire, date_approx, envoye_at, created_at)
    select id, 'initial', 'ancien_systeme', 'historique', email_actuel, 'Activez votre espace Major ECN',
           'Reprise : e-mail d’activation envoyé à l’inscription (date d’après le compte).', true, acces_initial_at, acces_initial_at
      from ins
    returning id, candidat_id, envoye_at
  ), ev as (
    insert into public.decouverte_evenements (candidat_id, envoi_id, type, survenu_at, details)
    select i.id, null::uuid, 'demande', i.demande_at, jsonb_build_object('source', 'reprise') from ins i
    union all
    select i.id, null::uuid, 'compte_cree', i.compte_cree_at, jsonb_build_object('source', 'reprise') from ins i where i.compte_cree_at is not null
    union all
    select e.candidat_id, e.id, 'acces_initial', e.envoye_at, jsonb_build_object('source', 'reprise', 'date_approchee', true) from env e
    returning 1
  )
  select count(*) into v_nouveaux from ins;

  -- 2. Dernière relance de l'ancien système automatique
  with src as (
    select c.id as candidat_id, c.email_actuel, p.last_relance_at
      from public.decouverte_candidats c
      join public.profiles p on p.id = c.user_id
     where p.last_relance_at is not null
       and not exists (
         select 1 from public.decouverte_envois e
          where e.candidat_id = c.id and e.type = 'ancienne_relance' and e.origine = 'ancien_systeme'
            and e.envoye_at = p.last_relance_at)
  ), env as (
    insert into public.decouverte_envois (candidat_id, type, origine, statut, email_utilise, sujet, commentaire, envoye_at, created_at)
    select candidat_id, 'ancienne_relance', 'ancien_systeme', 'historique', email_actuel, 'Relance automatique (ancien système)',
           'Relance de l’ancien système automatique (tous les 7 jours) : seule la plus récente est connue.', last_relance_at, last_relance_at
      from src
    returning id, candidat_id, envoye_at
  ), ev as (
    insert into public.decouverte_evenements (candidat_id, envoi_id, type, survenu_at, details)
    select candidat_id, id, 'relance_ancien_systeme', envoye_at, jsonb_build_object('source', 'reprise') from env
    returning 1
  )
  select count(*) into v_hist from env;

  -- 3. Premières connexions manquées (date approchée)
  with src as (
    select c.id,
           least(
             case when u.email_confirmed_at >= coalesce(c.compte_cree_at, u.created_at) then u.email_confirmed_at end,
             (select min(s.created_at) from auth.sessions s where s.user_id = u.id),
             u.last_sign_in_at
           ) as premiere
      from public.decouverte_candidats c
      join auth.users u on u.id = c.user_id
     where c.premiere_connexion_at is null
       and u.last_sign_in_at is not null
  ), upd as (
    update public.decouverte_candidats c
       set premiere_connexion_at = s.premiere,
           premiere_connexion_approx = true,
           updated_at = now()
      from src s
     where c.id = s.id
    returning c.id, c.premiere_connexion_at
  ), ev as (
    insert into public.decouverte_evenements (candidat_id, type, survenu_at, details)
    select id, 'premiere_connexion', premiere_connexion_at, jsonb_build_object('source', 'synchronisation', 'date_approchee', true) from upd
    returning 1
  )
  select count(*) into v_connexions from upd;

  -- 4a. Changement d'adresse : historisé, liens révoqués, blocage levé si l'adresse a changé
  with chg as (
    select c.id, c.email_actuel as ancien, u.email as nouveau, c.email_bloque_adresse
      from public.decouverte_candidats c
      join auth.users u on u.id = c.user_id
     where nullif(btrim(u.email), '') is not null
       and lower(btrim(u.email)) <> c.email_normalise
  ), ev as (
    insert into public.decouverte_evenements (candidat_id, type, details)
    select id, 'email_modifie', jsonb_build_object('ancien', ancien, 'nouveau', nouveau) from chg
    union all
    select id, 'adresse_debloquee', jsonb_build_object('adresse_bloquee', email_bloque_adresse, 'nouvelle_adresse', nouveau)
      from chg where email_bloque_adresse is not null and email_bloque_adresse <> lower(btrim(nouveau))
    returning 1
  ), rev as (
    update public.decouverte_liens l
       set revoque_at = now(), revoque_raison = 'adresse e-mail modifiée'
      from chg
     where l.candidat_id = chg.id and l.revoque_at is null
    returning 1
  ), upd as (
    update public.decouverte_candidats c
       set email_actuel = btrim(chg.nouveau),
           email_bloque_adresse = case when c.email_bloque_adresse = lower(btrim(chg.nouveau)) then c.email_bloque_adresse end,
           email_bloque_raison = case when c.email_bloque_adresse = lower(btrim(chg.nouveau)) then c.email_bloque_raison end,
           email_bloque_at = case when c.email_bloque_adresse = lower(btrim(chg.nouveau)) then c.email_bloque_at end,
           updated_at = now()
      from chg
     where c.id = chg.id
    returning 1
  )
  select count(*) into v_emails from upd;

  -- 4b. Dernière connexion + identité (silencieux)
  update public.decouverte_candidats c
     set derniere_connexion_at = u.last_sign_in_at,
         prenom = coalesce(p.first_name, c.prenom),
         nom = coalesce(p.last_name, c.nom),
         telephone = coalesce(p.phone, c.telephone),
         updated_at = now()
    from auth.users u, public.profiles p
   where u.id = c.user_id and p.id = c.user_id
     and (c.derniere_connexion_at is distinct from u.last_sign_in_at
          or c.prenom is distinct from coalesce(p.first_name, c.prenom)
          or c.nom is distinct from coalesce(p.last_name, c.nom)
          or c.telephone is distinct from coalesce(p.phone, c.telephone));

  update public.decouverte_parametres set derniere_synchro_at = now() where id = 1;

  return jsonb_build_object('nouveaux', v_nouveaux, 'relances_ancien_systeme', v_hist,
                            'premieres_connexions', v_connexions, 'adresses_modifiees', v_emails);
end $$;

-- ─────────────────────────────── État complet ───────────────────────────────
-- Une seule valeur jsonb (une ligne) : jamais tronquée par PostgREST. Relit
-- auth.users et profiles À CHAQUE APPEL (contrôle serveur frais du §11).
-- p_ids NULL = tous les candidats de la faculté.
create or replace function public.decouverte_etat(p_ids uuid[] default null)
returns jsonb language sql stable security definer set search_path = public as $$
  with c as (
    select c.*,
           u.email as auth_email,
           u.last_sign_in_at as auth_last_sign_in_at,
           u.banned_until as auth_banned_until,
           u.deleted_at as auth_deleted_at,
           (u.id is not null) as auth_existe,
           (p.id is not null) as profil_existe,
           p.is_active as profil_actif,
           p.permission_scope->>'offer' as profil_offre,
           p.permission_scope->>'espace_decouverte' as profil_espace_decouverte
      from public.decouverte_candidats c
      left join auth.users u on u.id = c.user_id
      left join public.profiles p on p.id = c.user_id
     where c.faculte_id = 'major-ecn'
       and (p_ids is null or c.id = any (p_ids))
  )
  select jsonb_build_object(
    'maintenant', now(),
    'candidats', coalesce((select jsonb_agg(to_jsonb(c) order by c.demande_at, c.id) from c), '[]'::jsonb),
    'envois', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'candidat_id', e.candidat_id, 'type', e.type, 'origine', e.origine, 'exceptionnel', e.exceptionnel,
        'statut', e.statut, 'email_utilise', e.email_utilise, 'sujet', e.sujet, 'modele_version', e.modele_version,
        'operation_id', e.operation_id, 'envoye_par', e.envoye_par, 'envoye_par_nom', e.envoye_par_nom, 'commentaire', e.commentaire,
        'date_approx', e.date_approx, 'created_at', e.created_at, 'envoye_at', e.envoye_at,
        'delivre_at', e.delivre_at, 'ouvert_at', e.ouvert_at, 'nb_ouvertures', e.nb_ouvertures,
        'clic_cta_at', e.clic_cta_at, 'nb_clics_cta', e.nb_clics_cta, 'clic_video_at', e.clic_video_at,
        'nb_clics_video', e.nb_clics_video, 'dernier_clic_at', e.dernier_clic_at,
        'bounce_at', e.bounce_at, 'bounce_type', e.bounce_type, 'plainte_at', e.plainte_at,
        'desinscrit_at', e.desinscrit_at, 'erreur', e.erreur) order by e.created_at, e.id)
        from public.decouverte_envois e
       where e.candidat_id in (select id from c)), '[]'::jsonb),
    'oppositions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', o.id, 'email_normalise', o.email_normalise, 'user_id', o.user_id, 'candidat_id', o.candidat_id,
        'source', o.source, 'envoi_id', o.envoi_id, 'created_at', o.created_at) order by o.created_at, o.id)
        from public.communication_oppositions o
       where o.faculte_id = 'major-ecn'
         and (p_ids is null
              or o.candidat_id = any (p_ids)
              or o.email_normalise in (select email_normalise from c)
              or o.email_normalise in (select lower(btrim(auth_email)) from c where auth_email is not null)
              or o.user_id in (select user_id from c where user_id is not null))), '[]'::jsonb)
  );
$$;

-- ─────────────────────────────── Réservation d'items ───────────────────────────────
-- Deux appels concurrents d'exécution (double clic, deux onglets) ne traitent
-- jamais le même item : FOR UPDATE SKIP LOCKED. Un item resté « en_cours »
-- plus de 3 minutes (fonction interrompue) est repris — son envoi garde le
-- même identifiant, donc la même clé d'idempotence Resend.
create or replace function public.decouverte_reserver_items(p_operation uuid, p_limite integer)
returns setof public.decouverte_operation_items
language sql security definer set search_path = public as $$
  update public.decouverte_operation_items i
     set statut = 'en_cours', claimed_at = now(), tentatives = i.tentatives + 1
   where i.id in (
     select x.id from public.decouverte_operation_items x
      where x.operation_id = p_operation
        and (x.statut = 'a_traiter' or (x.statut = 'en_cours' and x.claimed_at < now() - interval '3 minutes'))
      order by x.id
      limit greatest(1, least(p_limite, 100))
      for update skip locked)
  returning i.*;
$$;

revoke all on function public.decouverte_synchroniser() from public, anon, authenticated;
revoke all on function public.decouverte_etat(uuid[]) from public, anon, authenticated;
revoke all on function public.decouverte_reserver_items(uuid, integer) from public, anon, authenticated;
revoke all on function public.decouverte_compte_supprime() from public, anon, authenticated;
grant execute on function public.decouverte_synchroniser() to service_role;
grant execute on function public.decouverte_etat(uuid[]) to service_role;
grant execute on function public.decouverte_reserver_items(uuid, integer) to service_role;

grant select, insert, update, delete on public.decouverte_parametres, public.decouverte_candidats, public.decouverte_envois,
  public.decouverte_liens, public.decouverte_operations, public.decouverte_operation_items to service_role;
grant select, insert on public.decouverte_evenements, public.decouverte_journal, public.communication_oppositions to service_role;
