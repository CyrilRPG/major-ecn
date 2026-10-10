-- ============================================================================
-- Cockpit administrateur et messagerie administrative intelligente
-- (CDC « Mon cockpit administrateur » — version consolidée du 08/10/2026,
-- addendum « Cockpit de pilotage opérationnel », rubrique « Réclamations &
-- Améliorations »).
--
-- Confidentialité (§4, règle impérative) : le cockpit, ses tâches, objectifs,
-- notes et rendez-vous sont PRIVÉS par défaut, y compris vis-à-vis des autres
-- administrateurs. Aucune policy RLS n'est ouverte : toutes les lectures et
-- écritures passent par le serveur (service-role), qui applique les règles de
-- `src/lib/cockpit/regles.ts` (propriétaire, partage explicite, affectation).
-- ============================================================================

-- --------------------------------------------------------------------------
-- Tâches (§3) — statuts, priorités, catégories, rappels, récurrence, lien
-- --------------------------------------------------------------------------
create table if not exists public.cockpit_taches (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  titre            text not null check (char_length(titre) between 1 and 300),
  description      text,
  priorite         text not null default 'normale' check (priorite in ('basse','normale','haute','urgente')),
  statut           text not null default 'a_faire'
                     check (statut in ('a_faire','en_cours','attente_reponse','reponse_recue','reportee','terminee','annulee')),
  categorie        text not null default 'administration' check (char_length(categorie) between 1 and 60),
  echeance         date,
  heure            time,
  rappel_at        timestamptz,
  rappel_envoye_at timestamptz,
  recurrence       text not null default 'aucune' check (recurrence in ('aucune','quotidienne','hebdomadaire','mensuelle')),
  notes            text,
  -- Lien interne (fiche enseignant, élève, conversation, demande, réclamation…)
  lien_type        text check (lien_type in ('enseignant','eleve','conversation','demande','reclamation','amelioration','rdv','ressource')),
  lien_id          text,
  lien_label       text,
  assignee_id      uuid references auth.users(id) on delete set null,
  -- « Mes 3 priorités du jour » : la tâche est épinglée pour ce jour, à ce rang.
  priorite_jour    date,
  rang_priorite    smallint check (rang_priorite between 1 and 3),
  ordre            double precision not null default 0,
  terminee_at      timestamptz,
  archivee_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists cockpit_taches_owner_idx on public.cockpit_taches(owner_id, statut, echeance);
create index if not exists cockpit_taches_assignee_idx on public.cockpit_taches(assignee_id) where assignee_id is not null;
create index if not exists cockpit_taches_rappel_idx on public.cockpit_taches(rappel_at) where rappel_envoye_at is null and rappel_at is not null;
create index if not exists cockpit_taches_lien_idx on public.cockpit_taches(lien_type, lien_id) where lien_id is not null;
alter table public.cockpit_taches enable row level security;

-- Partage volontaire (§4) : lecture, commentaire ou modification ; révocable.
create table if not exists public.cockpit_partages (
  id          uuid primary key default gen_random_uuid(),
  objet_type  text not null check (objet_type in ('tache','rdv')),
  objet_id    uuid not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  droit       text not null default 'lecture' check (droit in ('lecture','commentaire','modification')),
  created_at  timestamptz not null default now(),
  revoque_at  timestamptz
);
create unique index if not exists cockpit_partages_actif_uidx
  on public.cockpit_partages(objet_type, objet_id, user_id) where revoque_at is null;
create index if not exists cockpit_partages_user_idx on public.cockpit_partages(user_id) where revoque_at is null;
alter table public.cockpit_partages enable row level security;

create table if not exists public.cockpit_commentaires (
  id          uuid primary key default gen_random_uuid(),
  tache_id    uuid not null references public.cockpit_taches(id) on delete cascade,
  auteur_id   uuid not null references auth.users(id) on delete cascade,
  texte       text not null check (char_length(texte) between 1 and 4000),
  created_at  timestamptz not null default now()
);
create index if not exists cockpit_commentaires_tache_idx on public.cockpit_commentaires(tache_id, created_at);
alter table public.cockpit_commentaires enable row level security;

-- Historique des objets + journal d'audit des partages, envois et actions sensibles (§11).
create table if not exists public.cockpit_journal (
  id          bigint generated always as identity primary key,
  objet_type  text not null,
  objet_id    text not null,
  acteur_id   uuid references auth.users(id) on delete set null,
  action      text not null,
  details     jsonb not null default '{}'::jsonb,
  audit       boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists cockpit_journal_objet_idx on public.cockpit_journal(objet_type, objet_id, created_at desc);
create index if not exists cockpit_journal_audit_idx on public.cockpit_journal(created_at desc) where audit;
alter table public.cockpit_journal enable row level security;

-- --------------------------------------------------------------------------
-- Rendez-vous, objectifs, notes personnelles
-- --------------------------------------------------------------------------
create table if not exists public.cockpit_rdv (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references auth.users(id) on delete cascade,
  titre           text not null check (char_length(titre) between 1 and 300),
  genre           text not null default 'rendez_vous' check (genre in ('rendez_vous','reunion','appel','echeance','autre')),
  debut           timestamptz not null,
  fin             timestamptz,
  personne_type   text check (personne_type in ('enseignant','eleve','client','externe')),
  personne_id     uuid references auth.users(id) on delete set null,
  personne_label  text,
  objet           text,
  lieu            text,
  lien_visio      text check (lien_visio is null or lien_visio ~ '^https://'),
  coordonnees     text,
  notes           text,
  documents       jsonb not null default '[]'::jsonb,
  tache_suivi_id  uuid references public.cockpit_taches(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (fin is null or fin >= debut)
);
create index if not exists cockpit_rdv_owner_idx on public.cockpit_rdv(owner_id, debut);
alter table public.cockpit_rdv enable row level security;

create table if not exists public.cockpit_objectifs (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  periode     text not null check (periode in ('jour','semaine','mois')),
  debut       date not null,
  texte       text not null check (char_length(texte) between 1 and 500),
  atteint     boolean not null default false,
  updated_at  timestamptz not null default now(),
  unique (owner_id, periode, debut)
);
alter table public.cockpit_objectifs enable row level security;

create table if not exists public.cockpit_notes (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  contenu     text not null check (char_length(contenu) between 1 and 10000),
  epinglee    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists cockpit_notes_owner_idx on public.cockpit_notes(owner_id, updated_at desc);
alter table public.cockpit_notes enable row level security;

-- --------------------------------------------------------------------------
-- Demandes clients (téléphone, e-mail…) — pédagogiques, administratives,
-- commerciales, comptables (addendum D et E)
-- --------------------------------------------------------------------------
create table if not exists public.cockpit_demandes (
  id            uuid primary key default gen_random_uuid(),
  numero        bigint generated always as identity,
  created_by    uuid not null references auth.users(id) on delete cascade,
  client_id     uuid references auth.users(id) on delete set null,
  client_label  text not null check (char_length(client_label) between 1 and 200),
  client_contact text,
  canal         text not null default 'telephone' check (canal in ('telephone','email','messagerie','courrier','autre')),
  recue_at      timestamptz not null default now(),
  nature        text not null default 'administrative' check (nature in ('pedagogique','administrative','commerciale','comptable')),
  sous_type     text check (sous_type in ('facture','echeancier','paiement','justificatif','remboursement','autre')),
  motif         text not null check (char_length(motif) between 1 and 300),
  resume        text,
  priorite      text not null default 'normale' check (priorite in ('basse','normale','haute','urgente')),
  assignee_id   uuid references auth.users(id) on delete set null,
  echeance      date,
  statut        text not null default 'a_traiter' check (statut in ('a_traiter','en_cours','en_attente','terminee')),
  tache_id      uuid references public.cockpit_taches(id) on delete set null,
  cloturee_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists cockpit_demandes_statut_idx on public.cockpit_demandes(statut, echeance);
create index if not exists cockpit_demandes_client_idx on public.cockpit_demandes(client_id) where client_id is not null;
alter table public.cockpit_demandes enable row level security;

-- --------------------------------------------------------------------------
-- Réclamations & Améliorations (pilotage qualité)
-- --------------------------------------------------------------------------
create table if not exists public.cockpit_ameliorations (
  id              uuid primary key default gen_random_uuid(),
  numero          bigint generated always as identity,
  titre           text not null check (char_length(titre) between 1 and 300),
  module          text,
  probleme        text,
  action_prevue   text,
  suivi           text,
  priorite        text not null default 'normale' check (priorite in ('basse','normale','haute','urgente')),
  statut          text not null default 'a_planifier'
                    check (statut in ('a_planifier','a_traiter','en_cours','a_valider','realisee','verifiee','abandonnee')),
  responsable_id  uuid references auth.users(id) on delete set null,
  echeance        date,
  tache_id        uuid references public.cockpit_taches(id) on delete set null,
  created_by      uuid references auth.users(id) on delete set null,
  realisee_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.cockpit_ameliorations enable row level security;

create table if not exists public.cockpit_reclamations (
  id               uuid primary key default gen_random_uuid(),
  created_by       uuid references auth.users(id) on delete set null,
  candidat_id      uuid references auth.users(id) on delete set null,
  candidat_label   text not null check (char_length(candidat_label) between 1 and 200),
  specialite       text,
  categorie        text not null default 'fonctionnalite'
                     check (categorie in ('fonctionnalite','contenu','pedagogie','technique','service','facturation','autre')),
  type_probleme    text not null default 'individuel'
                     check (type_probleme in ('individuel','pedagogique_collectif','technique','service')),
  sujet            text not null check (char_length(sujet) between 1 and 300),
  description      text,
  canal            text not null default 'telephone' check (canal in ('telephone','email','messagerie','courrier','autre')),
  priorite         text not null default 'normale' check (priorite in ('basse','normale','haute','urgente')),
  statut           text not null default 'a_traiter' check (statut in ('a_traiter','a_analyser','en_cours','resolu','cloturee')),
  amelioration_id  uuid references public.cockpit_ameliorations(id) on delete set null,
  assignee_id      uuid references auth.users(id) on delete set null,
  tache_id         uuid references public.cockpit_taches(id) on delete set null,
  a_recontacter    boolean not null default false,
  recontacte_at    timestamptz,
  satisfaction     text check (satisfaction in ('satisfait','neutre','insatisfait')),
  resolue_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists cockpit_reclamations_statut_idx on public.cockpit_reclamations(statut, created_at desc);
create index if not exists cockpit_reclamations_candidat_idx on public.cockpit_reclamations(candidat_id) where candidat_id is not null;
create index if not exists cockpit_reclamations_amelioration_idx on public.cockpit_reclamations(amelioration_id) where amelioration_id is not null;
alter table public.cockpit_reclamations enable row level security;

-- --------------------------------------------------------------------------
-- Messagerie administrative privée (§5 à §9) — distincte du forum et des
-- Échanges des élèves. Source de vérité = la conversation interne.
-- --------------------------------------------------------------------------
create table if not exists public.cockpit_conversations (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references auth.users(id) on delete cascade,
  interlocuteur_type  text not null default 'enseignant' check (interlocuteur_type in ('enseignant','eleve','client')),
  interlocuteur_id    uuid references auth.users(id) on delete set null,
  interlocuteur_label text not null,
  interlocuteur_email text,
  sujet               text not null check (char_length(sujet) between 1 and 300),
  mission             text,
  tache_id            uuid references public.cockpit_taches(id) on delete set null,
  suivie              boolean not null default true,
  archivee_at         timestamptz,
  dernier_message_at  timestamptz not null default now(),
  created_at          timestamptz not null default now()
);
create index if not exists cockpit_conversations_owner_idx on public.cockpit_conversations(owner_id, dernier_message_at desc);
create index if not exists cockpit_conversations_interlocuteur_idx on public.cockpit_conversations(interlocuteur_id, dernier_message_at desc) where interlocuteur_id is not null;
alter table public.cockpit_conversations enable row level security;

create table if not exists public.cockpit_messages (
  id                 uuid primary key default gen_random_uuid(),
  conversation_id    uuid not null references public.cockpit_conversations(id) on delete cascade,
  auteur_id          uuid references auth.users(id) on delete set null,
  sens               text not null check (sens in ('sortant','entrant')),
  corps              text not null check (char_length(corps) between 1 and 20000),
  brouillon          boolean not null default false,
  -- Un double clic ou un rejeu réseau ne crée jamais un second message (C12).
  cle_idempotence    text unique,
  redige_avec_ia     boolean not null default false,
  saisie_manuelle    boolean not null default false,
  envoye_at          timestamptz,
  lu_at              timestamptz,
  traite_at          timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists cockpit_messages_conv_idx on public.cockpit_messages(conversation_id, created_at);
create index if not exists cockpit_messages_non_traites_idx on public.cockpit_messages(conversation_id) where sens = 'entrant' and traite_at is null;
alter table public.cockpit_messages enable row level security;

-- Envois externes (e-mail, push) : UNE ligne par message et par canal, quel
-- que soit le nombre de tentatives (C12) ; l'échec est tracé (C15).
create table if not exists public.cockpit_envois (
  id              uuid primary key default gen_random_uuid(),
  message_id      uuid not null references public.cockpit_messages(id) on delete cascade,
  canal           text not null check (canal in ('email','push')),
  role            text not null check (role in ('destinataire','copie_proprietaire')),
  destinataire    text,
  objet           text,
  statut          text not null default 'en_file' check (statut in ('en_file','envoye','echec','non_disponible')),
  tentatives      int not null default 0,
  derniere_erreur text,
  fournisseur_id  text,
  envoye_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (message_id, canal, role)
);
create index if not exists cockpit_envois_reprise_idx on public.cockpit_envois(statut, updated_at) where statut in ('en_file','echec');
alter table public.cockpit_envois enable row level security;

create table if not exists public.cockpit_pieces_jointes (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.cockpit_messages(id) on delete cascade,
  chemin      text not null unique,
  nom         text not null,
  taille      bigint not null check (taille between 1 and 15728640),
  mime        text,
  created_at  timestamptz not null default now()
);
alter table public.cockpit_pieces_jointes enable row level security;

-- --------------------------------------------------------------------------
-- Notifications internes du cockpit (§10) — regroupées par `group_key`
-- --------------------------------------------------------------------------
create table if not exists public.cockpit_notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  genre       text not null check (genre in ('reponse','rappel','echeance','partage','affectation','message','demande','reclamation')),
  titre       text not null,
  corps       text,
  lien        text,
  group_key   text not null,
  nombre      int not null default 1,
  lu_at       timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, group_key)
);
create index if not exists cockpit_notifications_user_idx on public.cockpit_notifications(user_id, updated_at desc);
alter table public.cockpit_notifications enable row level security;

create table if not exists public.cockpit_reglages (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  email_rappels        boolean not null default true,
  email_affectations   boolean not null default true,
  push                 boolean not null default true,
  signature            text,
  updated_at           timestamptz not null default now()
);
alter table public.cockpit_reglages enable row level security;

-- Seau privé des pièces jointes (lecture par URL signée après contrôle serveur).
insert into storage.buckets (id, name, public, file_size_limit)
values ('cockpit', 'cockpit', false, 15728640)
on conflict (id) do nothing;

-- Major Odontologie partage ce projet Supabase : les dossiers communs à
-- l'équipe (demandes, réclamations, améliorations) sont bornés à leur école.
alter table public.cockpit_demandes      add column if not exists faculte_id text not null default 'major-ecn';
alter table public.cockpit_reclamations  add column if not exists faculte_id text not null default 'major-ecn';
alter table public.cockpit_ameliorations add column if not exists faculte_id text not null default 'major-ecn';
