-- ════════════════════════════════════════════════════════════════════════
-- MODULE « ÉCHANGES » — messagerie collective pédagogique (CDC complémentaire
-- Major ECN, oct. 2026, §1 à §209).
--
-- Principes :
--  · Toutes les tables sont en RLS SANS policy : aucun accès direct depuis le
--    navigateur ou l'app (PostgREST anon/authenticated ne voit rien). Toute
--    lecture/écriture passe par les routes serveur (service role) qui vérifient
--    identité, rôle, groupe, droits sur le message et sanctions (§97).
--  · Rien n'est détruit par une suppression d'élève ou de modération : le
--    message disparaît du flux (supprime_at) et reste consultable par
--    l'administration jusqu'à la purge prévue par la politique de conservation
--    (§43, §139). La purge efface le contenu (purge_at), sans retour possible.
--  · Le journal d'audit est en ajout seul (trigger) : ni modification ni
--    suppression, sauf par la purge de conservation (§47).
--  · Idempotence : un tag = (message, enseignant) unique ; un e-mail = une clé
--    unique ; la relance H+12 est réservée par un UPDATE conditionnel (§88).
--
-- Migration rejouable (if not exists / or replace).
-- ════════════════════════════════════════════════════════════════════════

-- ─── Normalisation pour la recherche (sans dépendre de l'extension unaccent) ───
create or replace function public.echanges_normaliser(t text)
returns text language sql immutable parallel safe as $$
  select translate(
    replace(replace(lower(coalesce(t, '')), 'œ', 'oe'), 'æ', 'ae'),
    'àâäáãåçéèêëíìîïñóòôöõúùûüýÿ',
    'aaaaaaceeeeiiiinooooouuuuyy'
  )
$$;

-- Jeton aléatoire (canal temps réel d'un groupe) : 2 UUID v4 = 244 bits d'aléa.
create or replace function public.echanges_jeton()
returns text language sql volatile as $$
  select replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
$$;

-- ════════════════════════════ PARAMÈTRES ════════════════════════════════
create table if not exists public.echanges_parametres (
  id smallint primary key default 1 check (id = 1),
  -- Feature flag global (§145-146) : desactive | interne (équipe + comptes de test) | actif
  module_mode text not null default 'interne' check (module_mode in ('desactive', 'interne', 'actif')),
  testeurs uuid[] not null default '{}',
  -- Questions enseignants (§24, §27, §86, §128-130)
  relance_heures integer not null default 12 check (relance_heures between 1 and 168),
  escalade_active boolean not null default false,
  escalade_heures integer not null default 24 check (escalade_heures between 1 and 336),
  reponse_un_annule_autres boolean not null default false,
  marquer_traite_actif boolean not null default true,
  -- Publication (§69-73)
  edition_minutes integer not null default 15 check (edition_minutes between 0 and 1440),
  formats_autorises text[] not null default array['image/jpeg', 'image/png', 'application/pdf'],
  taille_max_mo integer not null default 10 check (taille_max_mo between 1 and 25),
  pj_max_par_message integer not null default 4 check (pj_max_par_message between 1 and 10),
  longueur_max integer not null default 4000 check (longueur_max between 200 and 20000),
  -- Anti-spam (§71-72)
  limite_messages_minute integer not null default 6,
  limite_messages_heure integer not null default 60,
  limite_tags_heure integer not null default 4,
  limite_tags_enseignant_jour integer not null default 3,
  limite_pj_heure integer not null default 15,
  doublon_secondes integer not null default 120,
  -- Affichage et réactions (§12, §19, §50)
  affichage_eleves text not null default 'prenom_initiale' check (affichage_eleves in ('pseudo', 'prenom', 'prenom_initiale')),
  reactions text[] not null default array['👍', '❤️', '🙏'],
  reactions_lecture_seule boolean not null default true,
  -- Accueil et règles (§109-110)
  message_accueil text not null default E'Bienvenue dans l''espace d''échanges de votre promotion.\n\nCet espace vous permet d''échanger avec les autres candidats et de solliciter vos enseignants lorsque cela est nécessaire.\n\nPour qu''un enseignant reçoive votre question, pensez à le taguer avec @.',
  regles_texte text not null default E'• Respectez les autres participants.\n• Aucun contenu injurieux, discriminant ou hors sujet.\n• Pas de publicité ni de spam.\n• Utilisez le tag enseignant (@) de façon raisonnable : il envoie un e-mail à l''enseignant.\n• Les contenus Major ECN sont confidentiels : ne les diffusez pas à l''extérieur.\n• L''échange de coordonnées personnelles (téléphone, e-mail, réseaux sociaux) n''est pas autorisé : toutes les discussions restent dans la messagerie Major ECN.',
  regles_acceptation_requise boolean not null default true,
  -- Coordonnées personnelles (§186-198)
  coordonnees_blocage_actif boolean not null default true,
  coordonnees_mode text not null default 'bloquer' check (coordonnees_mode in ('bloquer', 'moderation')),
  coordonnees_domaines_autorises text[] not null default array[
    'major-ecn.fr', 'has-sante.fr', 'legifrance.gouv.fr', 'service-public.fr', 'sante.gouv.fr', 'solidarites-sante.gouv.fr',
    'ansm.sante.fr', 'santepubliquefrance.fr', 'inserm.fr', 'who.int', 'ncbi.nlm.nih.gov', 'pubmed.ncbi.nlm.nih.gov',
    'cochrane.org', 'vidal.fr', 'base-donnees-publique.medicaments.gouv.fr', 'cngof.fr', 'sfmu.org', 'splf.fr',
    'sfcardio.fr', 'escardio.org', 'sfar.org', 'cnge.fr', 'uness.fr', 'doi.org', 'nejm.org', 'thelancet.com', 'bmj.com',
    'jamanetwork.com', 'em-consulte.com', 'sciencedirect.com', 'wikipedia.org'],
  -- Lien vers un site absent de la liste ci-dessus : publié, soumis à validation ou bloqué.
  liens_non_reconnus text not null default 'moderation' check (liens_non_reconnus in ('autoriser', 'moderation', 'bloquer')),
  coordonnees_images_analyse boolean not null default true,
  coordonnees_seuil_alerte integer not null default 3,
  -- Conservation et purge (§43, §94-96, §139, §209)
  conservation_supprimes_jours integer not null default 365 check (conservation_supprimes_jours >= 1),
  conservation_archives_jours integer not null default 1095 check (conservation_archives_jours >= 30),
  conservation_audit_jours integer not null default 1825 check (conservation_audit_jours >= 365),
  conservation_blocages_jours integer not null default 365 check (conservation_blocages_jours >= 30),
  conservation_journal_jours integer not null default 90 check (conservation_journal_jours >= 7),
  purge_auto_active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
insert into public.echanges_parametres (id) values (1) on conflict (id) do nothing;

-- ═══════════════════════════════ GROUPES ════════════════════════════════
-- Un groupe = une messagerie indépendante (promotion, spécialité, formules,
-- sélection nominative). Chaque groupe porte deux canaux : discussion et
-- annonces (§58-59).
create table if not exists public.echanges_groupes (
  id uuid primary key default gen_random_uuid(),
  -- Projet Supabase partagé avec Major Odontologie : chaque groupe appartient à une plateforme.
  faculte_id text not null default 'major-ecn',
  nom text not null check (length(btrim(nom)) between 2 and 120),
  annee integer check (annee between 2020 and 2100),
  promotion text,
  specialite_id text,
  specialite_nom text,
  description text,
  statut text not null default 'brouillon' check (statut in ('brouillon', 'active', 'cloturee', 'archivee')),
  visible boolean not null default true,
  mode_participants text not null default 'criteres' check (mode_participants in ('criteres', 'manuel', 'mixte')),
  criteres jsonb not null default '{}'::jsonb,
  moderation_prealable boolean not null default false,
  notifier_chaque_message boolean not null default false,
  bibliotheque_acces boolean not null default true,
  message_accueil text,
  date_ouverture timestamptz,
  date_cloture_prevue timestamptz,
  date_archivage_prevue timestamptz,
  alerte_archivage_jours integer not null default 7,
  alerte_archivage_envoyee_at timestamptz,
  ouverte_at timestamptz,
  cloturee_at timestamptz,
  cloturee_par uuid,
  archivee_at timestamptz,
  archivee_par uuid,
  conservation_legale boolean not null default false,
  duplique_de uuid references public.echanges_groupes(id) on delete set null,
  topic text not null default public.echanges_jeton(),
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists echanges_groupes_topic_uidx on public.echanges_groupes (topic);
create index if not exists echanges_groupes_statut_idx on public.echanges_groupes (faculte_id, statut, visible);

-- ─── Participants (candidats) ───
create table if not exists public.echanges_membres (
  groupe_id uuid not null references public.echanges_groupes(id) on delete cascade,
  user_id uuid not null,
  source text not null default 'auto' check (source in ('auto', 'manuel')),
  statut text not null default 'actif' check (statut in ('actif', 'retire')),
  exclusion_forcee boolean not null default false,
  ajoute_at timestamptz not null default now(),
  ajoute_par uuid,
  retire_at timestamptz,
  retire_par uuid,
  motif_retrait text,
  regles_acceptees_at timestamptz,
  sourdine boolean not null default false,
  primary key (groupe_id, user_id)
);
create index if not exists echanges_membres_user_idx on public.echanges_membres (user_id, statut);

-- ─── Identité publique de l'équipe (§113-117) ───
-- Distincte de l'identité administrative : jamais dérivée automatiquement du
-- nom du compte, pour qu'une modification administrative n'expose rien (§114).
create table if not exists public.echanges_identites (
  user_id uuid primary key,
  prenom_public text not null check (length(btrim(prenom_public)) between 1 and 40),
  qualite text not null default 'Enseignant Major ECN',
  specialite text,
  avatar_mode text not null default 'initiale' check (avatar_mode in ('initiale', 'majorecn', 'neutre', 'photo')),
  avatar_chemin text,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- ─── Enseignants autorisés par groupe (§85) ───
create table if not exists public.echanges_enseignants (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.echanges_groupes(id) on delete cascade,
  user_id uuid not null,
  qualite text,
  specialite_publique text,
  email_notification text,
  peut_publier boolean not null default true,
  peut_epingler boolean not null default true,
  actif boolean not null default true,
  ajoute_at timestamptz not null default now(),
  ajoute_par uuid,
  retire_at timestamptz,
  retire_par uuid,
  unique (groupe_id, user_id)
);
create index if not exists echanges_enseignants_user_idx on public.echanges_enseignants (user_id, actif);

-- ─── Niveaux administratifs (§102-103) ───
-- Le rôle `admin` du profil vaut Super Admin. Un membre du personnel (rôle
-- `professor`) peut recevoir ici un niveau limité au module.
create table if not exists public.echanges_staff (
  user_id uuid primary key,
  niveau text not null check (niveau in ('moderateur', 'admin_pedagogique')),
  groupes uuid[],
  peut_suspendre boolean not null default false,
  cree_par uuid,
  created_at timestamptz not null default now()
);

-- ═══════════════════════════════ MESSAGES ═══════════════════════════════
create table if not exists public.echanges_messages (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.echanges_groupes(id) on delete cascade,
  canal text not null default 'discussion' check (canal in ('discussion', 'annonces')),
  auteur_id uuid,
  auteur_type text not null check (auteur_type in ('candidat', 'enseignant', 'equipe', 'systeme')),
  contenu text,
  reponse_a uuid references public.echanges_messages(id) on delete set null,
  contexte jsonb,
  item_numero integer,
  specialite_id text,
  mentions uuid[] not null default '{}',
  statut text not null default 'publie' check (statut in ('publie', 'en_attente', 'refuse')),
  moderation_motif text,
  valide_par uuid,
  valide_at timestamptz,
  important boolean not null default false,
  accuse_lecture_requis boolean not null default false,
  epingle_at timestamptz,
  epingle_par uuid,
  epingle_question_id uuid references public.echanges_messages(id) on delete set null,
  modifie_at timestamptz,
  nb_modifications integer not null default 0,
  supprime_at timestamptz,
  supprime_par uuid,
  suppression_origine text check (suppression_origine in ('auteur', 'moderation', 'rgpd', 'refus')),
  purge_at timestamptz,
  client_id text,
  nb_pieces_jointes integer not null default 0,
  recherche tsvector generated always as (to_tsvector('french'::regconfig, public.echanges_normaliser(contenu))) stored,
  created_at timestamptz not null default now(),
  maj_at timestamptz not null default now()
);
create index if not exists echanges_messages_flux_idx on public.echanges_messages (groupe_id, canal, created_at desc, id desc);
create index if not exists echanges_messages_maj_idx on public.echanges_messages (groupe_id, maj_at);
create index if not exists echanges_messages_auteur_idx on public.echanges_messages (auteur_id, created_at desc);
create index if not exists echanges_messages_recherche_idx on public.echanges_messages using gin (recherche);
create index if not exists echanges_messages_epingles_idx on public.echanges_messages (groupe_id, epingle_at desc) where epingle_at is not null and supprime_at is null;
create index if not exists echanges_messages_supprimes_idx on public.echanges_messages (supprime_at desc) where supprime_at is not null;
create index if not exists echanges_messages_attente_idx on public.echanges_messages (created_at) where statut = 'en_attente' and supprime_at is null;
create index if not exists echanges_messages_item_idx on public.echanges_messages (item_numero) where item_numero is not null;
create unique index if not exists echanges_messages_client_uidx on public.echanges_messages (auteur_id, client_id) where client_id is not null;

-- Historique des versions (§73) : le texte AVANT chaque modification.
create table if not exists public.echanges_versions (
  id bigserial primary key,
  message_id uuid not null references public.echanges_messages(id) on delete cascade,
  contenu text,
  remplace_at timestamptz not null default now(),
  par uuid
);
create index if not exists echanges_versions_msg_idx on public.echanges_versions (message_id, remplace_at);

-- ─── Pièces jointes (§69-70, §99) ───
create table if not exists public.echanges_pieces_jointes (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.echanges_groupes(id) on delete cascade,
  message_id uuid references public.echanges_messages(id) on delete set null,
  uploader_id uuid not null,
  chemin text not null unique,
  nom text not null,
  mime text,
  taille bigint,
  legende text,
  statut text not null default 'en_attente_envoi' check (statut in ('en_attente_envoi', 'pret', 'attache', 'bloque', 'en_moderation')),
  verification jsonb,
  created_at timestamptz not null default now(),
  supprime_at timestamptz,
  purge_at timestamptz
);
create index if not exists echanges_pj_message_idx on public.echanges_pieces_jointes (message_id);
create index if not exists echanges_pj_uploader_idx on public.echanges_pieces_jointes (uploader_id, created_at desc);

-- ─── Réactions (§19) ───
create table if not exists public.echanges_reactions (
  message_id uuid not null references public.echanges_messages(id) on delete cascade,
  user_id uuid not null,
  emoji text not null check (length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

-- ─── Lectures (compteurs synchronisés entre appareils, §62-63) ───
create table if not exists public.echanges_lectures (
  groupe_id uuid not null references public.echanges_groupes(id) on delete cascade,
  user_id uuid not null,
  canal text not null check (canal in ('discussion', 'annonces')),
  dernier_lu_at timestamptz not null default now(),
  primary key (groupe_id, user_id, canal)
);

-- ─── Accusés de lecture des annonces importantes ───
create table if not exists public.echanges_accuses (
  message_id uuid not null references public.echanges_messages(id) on delete cascade,
  user_id uuid not null,
  accuse_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

-- ═══════════════════════ QUESTIONS ADRESSÉES (TAGS) ═════════════════════
-- Une ligne par (message, enseignant) : chaque enseignant tagué a son statut,
-- son e-mail et sa relance (§27). L'unicité rend le tag idempotent (§74, §88,
-- §127) : double clic, retry ou modification ne recréent jamais de tag.
create table if not exists public.echanges_tags (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.echanges_messages(id) on delete cascade,
  groupe_id uuid not null references public.echanges_groupes(id) on delete cascade,
  affectation_id uuid references public.echanges_enseignants(id) on delete set null,
  enseignant_id uuid not null,
  eleve_id uuid,
  tag_at timestamptz not null default now(),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'traitee', 'annulee', 'a_reaffecter')),
  reponse_message_id uuid references public.echanges_messages(id) on delete set null,
  repondu_at timestamptz,
  delai_secondes integer generated always as ((extract(epoch from (repondu_at - tag_at)))::integer) stored,
  traite_manuellement boolean not null default false,
  traite_par uuid,
  relance_due_at timestamptz not null,
  relance_envoyee_at timestamptz,
  en_retard_at timestamptz,
  escalade_envoyee_at timestamptz,
  annule_at timestamptz,
  annule_motif text,
  reaffecte_de uuid,
  unique (message_id, enseignant_id)
);
create index if not exists echanges_tags_enseignant_idx on public.echanges_tags (enseignant_id, statut, tag_at desc);
create index if not exists echanges_tags_relance_idx on public.echanges_tags (relance_due_at) where statut = 'en_attente' and relance_envoyee_at is null;
create index if not exists echanges_tags_groupe_idx on public.echanges_tags (groupe_id, tag_at desc);

-- ═════════════════════════ E-MAILS (BOÎTE D'ENVOI) ══════════════════════
-- Statut technique de chaque notification (§87) : a_envoyer → envoyee | echec
-- (après N tentatives) | annulee | simulee (environnement hors production, §143).
create table if not exists public.echanges_emails (
  id uuid primary key default gen_random_uuid(),
  cle text not null unique,
  type text not null check (type in ('tag_initial', 'tag_relance', 'tag_escalade', 'tag_reaffectation', 'avertissement', 'sanction', 'annonce_importante', 'archivage_alerte', 'blocage_alerte')),
  tag_id uuid references public.echanges_tags(id) on delete cascade,
  groupe_id uuid references public.echanges_groupes(id) on delete set null,
  destinataire_id uuid,
  destinataire_email text,
  donnees jsonb not null default '{}'::jsonb,
  statut text not null default 'a_envoyer' check (statut in ('a_envoyer', 'envoyee', 'echec', 'annulee', 'simulee', 'delivree')),
  tentatives integer not null default 0,
  derniere_erreur text,
  prochaine_tentative_at timestamptz not null default now(),
  verrou_at timestamptz,
  fournisseur_id text,
  created_at timestamptz not null default now(),
  envoyee_at timestamptz
);
create index if not exists echanges_emails_file_idx on public.echanges_emails (prochaine_tentative_at) where statut = 'a_envoyer';
create index if not exists echanges_emails_tag_idx on public.echanges_emails (tag_id);

-- ═══════════════════════════ MODÉRATION ═════════════════════════════════
create table if not exists public.echanges_sanctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  groupe_id uuid references public.echanges_groupes(id) on delete cascade,
  type text not null check (type in ('avertissement', 'lecture_seule', 'suspension', 'exclusion', 'restriction_tag')),
  motif text,
  message_eleve text,
  notifier_app boolean not null default true,
  notifier_email boolean not null default false,
  debut_at timestamptz not null default now(),
  fin_at timestamptz,
  cree_par uuid,
  cree_at timestamptz not null default now(),
  levee_at timestamptz,
  levee_par uuid,
  levee_motif text
);
create index if not exists echanges_sanctions_user_idx on public.echanges_sanctions (user_id, cree_at desc);

create table if not exists public.echanges_signalements (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.echanges_messages(id) on delete cascade,
  groupe_id uuid not null references public.echanges_groupes(id) on delete cascade,
  signale_par uuid not null,
  motif text not null,
  details text,
  statut text not null default 'a_examiner' check (statut in ('a_examiner', 'traite', 'sans_suite')),
  traite_par uuid,
  traite_at timestamptz,
  decision_note text,
  created_at timestamptz not null default now(),
  unique (message_id, signale_par)
);
create index if not exists echanges_signalements_statut_idx on public.echanges_signalements (statut, created_at desc);

-- Tentatives bloquées (coordonnées, spam, tags abusifs) : visibles en back-office (§72, §198).
create table if not exists public.echanges_blocages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  groupe_id uuid references public.echanges_groupes(id) on delete set null,
  type text not null check (type in ('coordonnees', 'spam', 'doublon', 'tag_abusif', 'piece_jointe')),
  source text not null default 'message' check (source in ('message', 'edition', 'legende', 'profil', 'image', 'document')),
  extrait text,
  motifs text[] not null default '{}',
  message_id uuid references public.echanges_messages(id) on delete set null,
  statut text not null default 'bloque' check (statut in ('bloque', 'en_moderation', 'libere', 'confirme')),
  traite_par uuid,
  traite_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists echanges_blocages_user_idx on public.echanges_blocages (user_id, created_at desc);
create index if not exists echanges_blocages_date_idx on public.echanges_blocages (created_at desc);

-- ═══════════════════════════ JOURNAL D'AUDIT ════════════════════════════
create table if not exists public.echanges_audit (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  action text not null,
  acteur_id uuid,
  acteur_role text,
  cible_user_id uuid,
  groupe_id uuid,
  message_id uuid,
  details jsonb not null default '{}'::jsonb
);
create index if not exists echanges_audit_date_idx on public.echanges_audit (created_at desc);
create index if not exists echanges_audit_cible_idx on public.echanges_audit (cible_user_id, created_at desc);
create index if not exists echanges_audit_groupe_idx on public.echanges_audit (groupe_id, created_at desc);

create or replace function public.echanges_audit_immuable()
returns trigger language plpgsql as $$
begin
  if tg_op = 'DELETE' and coalesce(current_setting('echanges.purge_audit', true), '') = 'on' then
    return old;
  end if;
  raise exception 'Journal d''audit Échanges : modification interdite (%).', tg_op using errcode = '42501';
end $$;
drop trigger if exists echanges_audit_immuable_trg on public.echanges_audit;
create trigger echanges_audit_immuable_trg before update or delete on public.echanges_audit
  for each row execute function public.echanges_audit_immuable();

-- ═════════════════════ BIBLIOTHÈQUE PÉDAGOGIQUE (§34-35, §108, §119-122) ════
create table if not exists public.echanges_bibliotheque (
  id uuid primary key default gen_random_uuid(),
  faculte_id text not null default 'major-ecn',
  titre text not null,
  question text,
  question_auteur text not null default 'Question d''un candidat',
  reponse text not null,
  enseignant_label text,
  enseignant_id uuid,
  specialite_id text,
  specialite_nom text,
  item_numero integer,
  item_titre text,
  mots_cles text[] not null default '{}',
  source_message_id uuid,
  source_question_id uuid,
  source_groupe_id uuid,
  valide_label text not null default 'Validée par un enseignant Major ECN',
  valide_at date not null default current_date,
  publie boolean not null default true,
  cree_par uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  recherche tsvector generated always as (
    to_tsvector('french'::regconfig, public.echanges_normaliser(coalesce(titre, '') || ' ' || coalesce(question, '') || ' ' || coalesce(reponse, '') || ' ' || coalesce(item_titre, '')))
  ) stored
);
create index if not exists echanges_biblio_recherche_idx on public.echanges_bibliotheque using gin (recherche);
create unique index if not exists echanges_biblio_source_uidx on public.echanges_bibliotheque (source_message_id) where source_message_id is not null;

-- ═════════════════════════ OBSERVABILITÉ (§142) ═════════════════════════
create table if not exists public.echanges_journal (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  niveau text not null default 'info' check (niveau in ('info', 'alerte', 'erreur')),
  source text not null,
  message text not null,
  details jsonb not null default '{}'::jsonb
);
create index if not exists echanges_journal_date_idx on public.echanges_journal (created_at desc);
create index if not exists echanges_journal_niveau_idx on public.echanges_journal (niveau, created_at desc);

create table if not exists public.echanges_cron_etat (
  nom text primary key,
  dernier_passage_at timestamptz not null default now(),
  duree_ms integer,
  resultat jsonb not null default '{}'::jsonb
);

-- ═════════════════════════════ TRIGGERS ═════════════════════════════════
-- Toute modification d'un message (texte, suppression, épinglage, validation)
-- avance `maj_at` : c'est le curseur de synchronisation des appareils.
create or replace function public.echanges_messages_maj()
returns trigger language plpgsql as $$
begin
  new.maj_at := clock_timestamp();
  return new;
end $$;
drop trigger if exists echanges_messages_maj_trg on public.echanges_messages;
create trigger echanges_messages_maj_trg before update on public.echanges_messages
  for each row execute function public.echanges_messages_maj();

-- Une réaction ajoutée ou retirée avance aussi le message.
create or replace function public.echanges_reactions_maj()
returns trigger language plpgsql as $$
begin
  update public.echanges_messages set maj_at = clock_timestamp()
   where id = coalesce(new.message_id, old.message_id);
  return null;
end $$;
drop trigger if exists echanges_reactions_maj_trg on public.echanges_reactions;
create trigger echanges_reactions_maj_trg after insert or delete on public.echanges_reactions
  for each row execute function public.echanges_reactions_maj();

create or replace function public.echanges_groupes_maj()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists echanges_groupes_maj_trg on public.echanges_groupes;
create trigger echanges_groupes_maj_trg before update on public.echanges_groupes
  for each row execute function public.echanges_groupes_maj();

-- ═══════════════════════════ FONCTIONS ══════════════════════════════════

-- Compteurs de non-lus d'un utilisateur, par groupe et par canal (§62).
-- Un message de l'utilisateur lui-même n'est jamais « non lu ». Les réponses
-- d'enseignant à une question de l'utilisateur sont comptées à part (§3).
create or replace function public.echanges_non_lus(p_user uuid, p_groupes uuid[])
returns table (groupe_id uuid, canal text, non_lus integer, reponses_enseignant integer, premier_non_lu timestamptz)
language sql stable as $$
  select m.groupe_id, m.canal,
         count(*)::int as non_lus,
         count(*) filter (where m.auteur_type in ('enseignant', 'equipe') and q.auteur_id = p_user)::int as reponses_enseignant,
         min(m.created_at) as premier_non_lu
    from public.echanges_messages m
    left join public.echanges_lectures l
      on l.groupe_id = m.groupe_id and l.user_id = p_user and l.canal = m.canal
    left join public.echanges_messages q on q.id = m.reponse_a
   where m.groupe_id = any (p_groupes)
     and m.statut = 'publie'
     and m.supprime_at is null
     and (m.auteur_id is distinct from p_user)
     and m.created_at > coalesce(l.dernier_lu_at, '-infinity'::timestamptz)
   group by m.groupe_id, m.canal
$$;

-- Réserve atomiquement des e-mails à envoyer (cron concurrent, retry) : un
-- e-mail n'est jamais pris par deux exécutions à la fois (SKIP LOCKED + verrou
-- de 10 minutes en cas de plantage au milieu d'un envoi).
create or replace function public.echanges_emails_reserver(p_limite integer default 50)
returns setof public.echanges_emails
language plpgsql as $$
begin
  return query
  with candidats as (
    select e.id from public.echanges_emails e
     where e.statut = 'a_envoyer'
       and e.prochaine_tentative_at <= now()
       and (e.verrou_at is null or e.verrou_at < now() - interval '10 minutes')
     order by e.prochaine_tentative_at
     limit p_limite
     for update skip locked
  )
  update public.echanges_emails e
     set verrou_at = now(), tentatives = e.tentatives + 1
    from candidats c
   where e.id = c.id
  returning e.*;
end $$;

-- Relances H+12 dues (§24, §128, R11, R14). L'UPDATE conditionnel sur
-- `relance_envoyee_at is null` garantit UNE relance par tag, même si le
-- traitement est rejoué ou exécuté deux fois en parallèle ; l'e-mail est créé
-- dans la même instruction avec une clé unique.
create or replace function public.echanges_relances_dues(p_maintenant timestamptz default now())
returns table (tag_id uuid, email_id uuid)
language plpgsql as $$
begin
  return query
  with dus as (
    update public.echanges_tags t
       set relance_envoyee_at = p_maintenant,
           en_retard_at = coalesce(t.en_retard_at, p_maintenant)
     where t.statut = 'en_attente'
       and t.relance_envoyee_at is null
       and t.relance_due_at <= p_maintenant
       and exists (select 1 from public.echanges_messages m where m.id = t.message_id and m.supprime_at is null)
    returning t.id, t.enseignant_id, t.groupe_id
  ), mails as (
    insert into public.echanges_emails (cle, type, tag_id, groupe_id, destinataire_id)
    select 'tag:' || d.id || ':relance', 'tag_relance', d.id, d.groupe_id, d.enseignant_id from dus d
    on conflict (cle) do nothing
    returning id, tag_id
  )
  select d.id, m.id from dus d left join mails m on m.tag_id = d.id;
end $$;

-- Escalade future paramétrable (§130) : H+N → alerte équipe Major ECN.
create or replace function public.echanges_escalades_dues(p_heures integer, p_maintenant timestamptz default now())
returns table (tag_id uuid, email_id uuid)
language plpgsql as $$
begin
  return query
  with dus as (
    update public.echanges_tags t
       set escalade_envoyee_at = p_maintenant
     where t.statut = 'en_attente'
       and t.escalade_envoyee_at is null
       and t.tag_at + make_interval(hours => p_heures) <= p_maintenant
       and exists (select 1 from public.echanges_messages m where m.id = t.message_id and m.supprime_at is null)
    returning t.id, t.groupe_id
  ), mails as (
    insert into public.echanges_emails (cle, type, tag_id, groupe_id)
    select 'tag:' || d.id || ':escalade', 'tag_escalade', d.id, d.groupe_id from dus d
    on conflict (cle) do nothing
    returning id, tag_id
  )
  select d.id, m.id from dus d left join mails m on m.tag_id = d.id;
end $$;

-- Un message supprimé (par l'élève ou la modération) annule les tags en attente
-- et les e-mails non partis qui s'y rattachent (§75, R39).
create or replace function public.echanges_annuler_tags_message(p_message uuid, p_motif text)
returns integer language plpgsql as $$
declare n integer;
begin
  with t as (
    update public.echanges_tags
       set statut = 'annulee', annule_at = now(), annule_motif = p_motif
     where message_id = p_message and statut in ('en_attente', 'a_reaffecter')
    returning id
  ), e as (
    update public.echanges_emails set statut = 'annulee'
     where tag_id in (select id from t) and statut = 'a_envoyer'
    returning id
  )
  select count(*) into n from t;
  return n;
end $$;

-- Purge de conservation (§139, R20) : efface définitivement le contenu des
-- messages supprimés depuis plus de N jours et des groupes archivés depuis plus
-- de M jours (sauf conservation légale). Renvoie les chemins des pièces jointes
-- à effacer du stockage. Aucune restauration possible ensuite.
create or replace function public.echanges_purger(p_maintenant timestamptz default now())
returns table (categorie text, nombre integer, chemins text[])
language plpgsql as $$
declare
  prm public.echanges_parametres;
  v_chemins text[];
  v_n integer;
begin
  select * into prm from public.echanges_parametres where id = 1;
  if prm is null or not prm.purge_auto_active then
    return;
  end if;

  -- 1. Messages supprimés au-delà de la durée de conservation.
  with cibles as (
    select m.id from public.echanges_messages m
      join public.echanges_groupes g on g.id = m.groupe_id
     where m.supprime_at is not null and m.purge_at is null
       and m.supprime_at < p_maintenant - make_interval(days => prm.conservation_supprimes_jours)
       and not g.conservation_legale
  ), pj as (
    update public.echanges_pieces_jointes p set purge_at = p_maintenant
     where p.message_id in (select id from cibles) and p.purge_at is null
    returning p.chemin
  ), v as (
    delete from public.echanges_versions where message_id in (select id from cibles)
  ), msg as (
    update public.echanges_messages m
       set contenu = null, contexte = null, purge_at = p_maintenant
     where m.id in (select id from cibles)
    returning m.id
  )
  select (select count(*) from msg)::int, coalesce((select array_agg(chemin) from pj), '{}') into v_n, v_chemins;
  categorie := 'messages_supprimes'; nombre := v_n; chemins := v_chemins; return next;

  -- 2. Groupes archivés au-delà de la durée de conservation des archives.
  with cibles as (
    select m.id from public.echanges_messages m
      join public.echanges_groupes g on g.id = m.groupe_id
     where g.statut = 'archivee' and g.archivee_at is not null
       and g.archivee_at < p_maintenant - make_interval(days => prm.conservation_archives_jours)
       and not g.conservation_legale
       and m.purge_at is null
  ), pj as (
    update public.echanges_pieces_jointes p set purge_at = p_maintenant
     where p.message_id in (select id from cibles) and p.purge_at is null
    returning p.chemin
  ), v as (
    delete from public.echanges_versions where message_id in (select id from cibles)
  ), msg as (
    update public.echanges_messages m
       set contenu = null, contexte = null, purge_at = p_maintenant
     where m.id in (select id from cibles)
    returning m.id
  )
  select (select count(*) from msg)::int, coalesce((select array_agg(chemin) from pj), '{}') into v_n, v_chemins;
  categorie := 'archives'; nombre := v_n; chemins := v_chemins; return next;

  -- 3. Pièces jointes jamais rattachées (envoi abandonné) depuis plus d'un jour.
  with pj as (
    update public.echanges_pieces_jointes p set purge_at = p_maintenant
     where p.message_id is null and p.purge_at is null and p.created_at < p_maintenant - interval '1 day'
    returning p.chemin
  )
  select count(*)::int, coalesce(array_agg(chemin), '{}') into v_n, v_chemins from pj;
  categorie := 'pieces_orphelines'; nombre := v_n; chemins := v_chemins; return next;

  -- 4. Tentatives bloquées, journal technique.
  delete from public.echanges_blocages where created_at < p_maintenant - make_interval(days => prm.conservation_blocages_jours);
  get diagnostics v_n = row_count;
  categorie := 'blocages'; nombre := v_n; chemins := '{}'; return next;

  delete from public.echanges_journal where created_at < p_maintenant - make_interval(days => prm.conservation_journal_jours);
  get diagnostics v_n = row_count;
  categorie := 'journal'; nombre := v_n; chemins := '{}'; return next;

  -- 5. Journal d'audit au-delà de sa durée (seule suppression autorisée).
  perform set_config('echanges.purge_audit', 'on', true);
  delete from public.echanges_audit where created_at < p_maintenant - make_interval(days => prm.conservation_audit_jours);
  get diagnostics v_n = row_count;
  perform set_config('echanges.purge_audit', 'off', true);
  categorie := 'audit'; nombre := v_n; chemins := '{}'; return next;
end $$;

-- ═════════════════════════ SÉCURITÉ D'ACCÈS ═════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'echanges_parametres', 'echanges_groupes', 'echanges_membres', 'echanges_identites', 'echanges_enseignants',
    'echanges_staff', 'echanges_messages', 'echanges_versions', 'echanges_pieces_jointes', 'echanges_reactions',
    'echanges_lectures', 'echanges_accuses', 'echanges_tags', 'echanges_emails', 'echanges_sanctions',
    'echanges_signalements', 'echanges_blocages', 'echanges_audit', 'echanges_bibliotheque', 'echanges_journal',
    'echanges_cron_etat'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    begin
      execute format('revoke all on public.%I from anon, authenticated', t);
    exception when undefined_object then null;
    end;
  end loop;
end $$;

do $$
begin
  revoke execute on function public.echanges_non_lus(uuid, uuid[]) from public;
  revoke execute on function public.echanges_emails_reserver(integer) from public;
  revoke execute on function public.echanges_relances_dues(timestamptz) from public;
  revoke execute on function public.echanges_escalades_dues(integer, timestamptz) from public;
  revoke execute on function public.echanges_annuler_tags_message(uuid, text) from public;
  revoke execute on function public.echanges_purger(timestamptz) from public;
exception when undefined_object then null;
end $$;

do $$
begin
  grant execute on function public.echanges_non_lus(uuid, uuid[]) to service_role;
  grant execute on function public.echanges_emails_reserver(integer) to service_role;
  grant execute on function public.echanges_relances_dues(timestamptz) to service_role;
  grant execute on function public.echanges_escalades_dues(integer, timestamptz) to service_role;
  grant execute on function public.echanges_annuler_tags_message(uuid, text) to service_role;
  grant execute on function public.echanges_purger(timestamptz) to service_role;
exception when undefined_object then null;
end $$;

-- ═══════════════════════ STOCKAGE DES PIÈCES JOINTES ════════════════════
-- Seau PRIVÉ : aucun lien public ; chaque téléchargement passe par
-- /api/echanges/fichiers/<id> qui revérifie l'accès au groupe et délivre une
-- URL signée de 60 secondes (§70, §99). Aucune policy : seul le service role
-- y lit et y écrit (téléversement par URL signée émise côté serveur).
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit)
    values ('echanges', 'echanges', false, 26214400)
    on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;
  end if;
end $$;
