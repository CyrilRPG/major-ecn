-- ============================================================================
-- Qualité & Suivi des candidats (CDC « Module de suivi des candidats, enquêtes
-- de satisfaction, qualité pédagogique, amélioration continue et traçabilité
-- Qualiopi » — version 1.0 consolidée du 08/10/2026).
--
-- Deux moteurs, une seule base :
--   - Survey Engine : questionnaires versionnés, envois (orchestrateur unique,
--     statuts, priorité, blocking_scope), réponses inaltérables, commentaires
--     (texte original inaltérable + classification corrigeable), alertes,
--     actions correctives, vérifications de contenu, journal.
--   - Learning Engine : n'est PAS dupliqué. Progression (lib/progress),
--     évaluations (evaluations_historique), activité (admin_activity_snapshot),
--     présences (session_presences) et visionnages sont LUS ; seules les
--     informations propres au suivi qualité sont stockées ici
--     (qualite_candidats, qualite_difficultes, qualite_interventions).
--
-- Confidentialité : aucune policy RLS. Toutes les lectures et écritures passent
-- par le serveur (service-role) qui applique les droits du module (administrateurs).
-- Les réponses nominatives ne sont jamais exposées aux enseignants.
--
-- Traçabilité : réponses et journal en ajout seul (déclencheurs) ; le texte
-- original d'un commentaire ne peut pas être modifié. La suppression d'un compte
-- (RGPD) anonymise les réponses (user_id → NULL) sans perdre les statistiques.
-- ============================================================================

-- --------------------------------------------------------------------------
-- Paramètres (§29) : une ligne unique, historisée (§29 « Toute modification
-- d'un paramètre doit être historisée »). Une ligne absente = valeurs du code.
-- --------------------------------------------------------------------------
create table if not exists public.qualite_parametres (
  id          smallint primary key default 1 check (id = 1),
  config      jsonb not null default '{}'::jsonb,
  updated_by  uuid references auth.users(id) on delete set null,
  updated_at  timestamptz not null default now()
);
alter table public.qualite_parametres enable row level security;

create table if not exists public.qualite_parametres_historique (
  id          bigint generated always as identity primary key,
  avant       jsonb,
  apres       jsonb not null,
  auteur_id   uuid references auth.users(id) on delete set null,
  auteur_nom  text,
  motif       text,
  at          timestamptz not null default now()
);
alter table public.qualite_parametres_historique enable row level security;

-- --------------------------------------------------------------------------
-- Questionnaires (modèles) : versionnés ; chaque envoi garde une copie des
-- questions posées (une réponse reste lisible si le modèle change).
-- --------------------------------------------------------------------------
create table if not exists public.qualite_questionnaires (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (code ~ '^[A-Z0-9_]{2,40}$'),
  famille      text not null check (famille in ('HOT','PROGRESS','FINAL','POST_EXAM','FOLLOW_UP','FUNDER_SURVEY')),
  titre        text not null check (char_length(titre) between 1 and 200),
  intro        text,
  questions    jsonb not null default '[]'::jsonb,
  -- HOT : questions complémentaires par type de séance (null = questionnaire de base)
  type_seance  text check (type_seance in ('cours','methodologie','qcm','dossier','correction','autre')),
  version      int not null default 1,
  actif        boolean not null default true,
  updated_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.qualite_questionnaires enable row level security;

create table if not exists public.qualite_questionnaires_versions (
  id                bigint generated always as identity primary key,
  questionnaire_id  uuid not null references public.qualite_questionnaires(id) on delete cascade,
  version           int not null,
  titre             text not null,
  intro             text,
  questions         jsonb not null,
  auteur_id         uuid references auth.users(id) on delete set null,
  at                timestamptz not null default now(),
  unique (questionnaire_id, version)
);
alter table public.qualite_questionnaires_versions enable row level security;

-- --------------------------------------------------------------------------
-- Séances pédagogiques (§30 learning_event_id) : un identifiant stable qui
-- rapproche le direct (platform_events) et son replay (videos), pour qu'une
-- même séance ne produise jamais deux questionnaires à chaud.
-- --------------------------------------------------------------------------
create table if not exists public.qualite_seances (
  id               uuid primary key default gen_random_uuid(),   -- learning_event_id
  event_id         uuid unique,      -- platform_events.id (direct)
  video_id         uuid unique,      -- videos.id (replay)
  titre            text not null,
  theme            text,
  type_seance      text not null default 'cours'
                     check (type_seance in ('cours','methodologie','qcm','dossier','correction','autre')),
  enseignant_nom   text,
  enseignant_cle   text,             -- nom normalisé (regroupement des statistiques)
  enseignant_id    uuid references auth.users(id) on delete set null,
  colleges         text[] not null default '{}',
  specialite_label text,
  voies            text[],
  debut_at         timestamptz,
  fin_at           timestamptz,
  lien             text not null default 'auto' check (lien in ('auto','manuel')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists qualite_seances_enseignant_idx on public.qualite_seances(enseignant_cle);
create index if not exists qualite_seances_debut_idx on public.qualite_seances(debut_at desc);
alter table public.qualite_seances enable row level security;

-- Visionnage des replays, par séance vidéo (le lecteur n'enregistrait jusqu'ici
-- qu'un booléen par item à 80 % et un instantané à 20 %).
create table if not exists public.qualite_visionnages (
  user_id          uuid not null references auth.users(id) on delete cascade,
  video_id         uuid not null,
  cours_id         uuid,
  ratio_max        real not null default 0 check (ratio_max between 0 and 1),
  secondes_max     int not null default 0,
  seuil_atteint_at timestamptz,
  premier_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (user_id, video_id)
);
create index if not exists qualite_visionnages_seuil_idx on public.qualite_visionnages(seuil_atteint_at) where seuil_atteint_at is not null;
alter table public.qualite_visionnages enable row level security;

-- Participations rapprochées (§4.1) : direct (émargement de la séance) ou replay
-- (visionnage au-delà du seuil) ; correction manuelle tracée.
create table if not exists public.qualite_participations (
  id           uuid primary key default gen_random_uuid(),
  seance_id    uuid not null references public.qualite_seances(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  mode         text not null check (mode in ('direct','replay')),
  source       text not null check (source in ('emargement','visionnage','manuel')),
  statut       text not null default 'valide' check (statut in ('valide','annule')),
  participe_at timestamptz,
  motif        text,
  corrige_par  uuid references auth.users(id) on delete set null,
  corrige_at   timestamptz,
  created_at   timestamptz not null default now(),
  unique (seance_id, user_id, mode)
);
create index if not exists qualite_participations_user_idx on public.qualite_participations(user_id);
alter table public.qualite_participations enable row level security;

-- --------------------------------------------------------------------------
-- Candidats : informations propres au suivi qualité (dates corrigées par
-- l'administration, pauses, aménagements, état de l'inactivité, résultat EVC).
-- --------------------------------------------------------------------------
create table if not exists public.qualite_candidats (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  debut_formation         date,
  fin_formation           date,
  premiere_epreuve        date,
  derniere_epreuve        date,
  exam_session_id         text,
  pause_du                date,
  pause_au                date,
  pause_motif             text,
  sans_blocage            boolean not null default false,
  sans_blocage_motif      text,
  exclu_relances          boolean not null default false,
  progression_pedago      real,
  progression_calendaire  real,
  progression_at          timestamptz,
  derniere_activite_at    timestamptz,
  inactivite_palier       smallint not null default 0,
  inactivite_palier_at    timestamptz,
  niveau_suivi            text not null default 'aucun' check (niveau_suivi in ('aucun','ponctuel','persistant','prioritaire')),
  resultat_evc            text,
  resultat_evc_statut     text check (resultat_evc_statut in ('declare','verifie')),
  resultat_evc_at         timestamptz,
  notes                   text,
  updated_by              uuid references auth.users(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
alter table public.qualite_candidats enable row level security;

-- --------------------------------------------------------------------------
-- Envois (§26) : une instance de questionnaire pour un candidat. L'orchestrateur
-- unique décide de la date, de la priorité et du périmètre de blocage.
-- --------------------------------------------------------------------------
create table if not exists public.qualite_envois (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  famille               text not null check (famille in ('HOT','PROGRESS','FINAL','POST_EXAM','FOLLOW_UP','FUNDER_SURVEY')),
  questionnaire_id      uuid references public.qualite_questionnaires(id) on delete set null,
  questionnaire_code    text,
  questionnaire_version int,
  titre                 text not null,
  intro                 text,
  questions             jsonb not null,
  cle                   text not null,
  seance_id             uuid references public.qualite_seances(id) on delete set null,
  exam_session_id       text,
  contexte              jsonb not null default '{}'::jsonb,
  statut                text not null default 'programme'
                          check (statut in ('programme','envoye','affiche','commence','complete','expire','neutralise','dispense')),
  obligatoire           boolean not null default false,
  priorite              smallint not null default 50,
  blocking_scope        text not null default 'aucun' check (blocking_scope in ('aucun','activites','pedagogie')),
  programme_pour        timestamptz not null default now(),
  echeance              timestamptz,
  envoye_at             timestamptz,
  affiche_at            timestamptz,
  commence_at           timestamptz,
  complete_at           timestamptz,
  expire_at             timestamptz,
  neutralise_at         timestamptz,
  neutralise_motif      text,
  dispense_at           timestamptz,
  dispense_motif        text,
  dispense_par          uuid references auth.users(id) on delete set null,
  -- Exception temporaire (§4.3, §28) : le blocage est levé jusqu'à cette date.
  suspendu_jusqu_au     timestamptz,
  suspendu_motif        text,
  suspendu_par          uuid references auth.users(id) on delete set null,
  jeton_hash            text unique,
  jeton_expire_at       timestamptz,
  email_envoye_at       timestamptz,
  relances              smallint not null default 0,
  derniere_relance_at   timestamptz,
  brouillon             jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, cle)
);
create index if not exists qualite_envois_user_idx on public.qualite_envois(user_id, statut);
create index if not exists qualite_envois_a_traiter_idx on public.qualite_envois(statut, programme_pour)
  where statut in ('programme','envoye','affiche','commence');
create index if not exists qualite_envois_famille_idx on public.qualite_envois(famille, statut, created_at desc);
create index if not exists qualite_envois_seance_idx on public.qualite_envois(seance_id) where seance_id is not null;
alter table public.qualite_envois enable row level security;

-- --------------------------------------------------------------------------
-- Réponses (inaltérables) : une seule par envoi ; copie des questions et du
-- contexte pédagogique au moment de la réponse.
-- --------------------------------------------------------------------------
create table if not exists public.qualite_reponses (
  id                    uuid primary key default gen_random_uuid(),
  envoi_id              uuid unique references public.qualite_envois(id) on delete set null,
  user_id               uuid references auth.users(id) on delete set null,
  famille               text not null,
  questionnaire_code    text,
  questionnaire_version int,
  questions             jsonb not null,
  reponses              jsonb not null,
  note_globale          smallint check (note_globale between 1 and 5),
  notes                 jsonb not null default '{}'::jsonb,
  note_min              smallint,
  difficulte            boolean,
  demande_contact       boolean,
  recommandation        smallint,
  seance_id             uuid,
  enseignant_nom        text,
  enseignant_cle        text,
  mode                  text,
  type_seance           text,
  colleges              text[] not null default '{}',
  voie                  text,
  formule               text,
  promotion             text,
  exam_session_id       text,
  canal                 text not null default 'web' check (canal in ('web','lien','app')),
  soumis_at             timestamptz not null default now()
);
create index if not exists qualite_reponses_famille_idx on public.qualite_reponses(famille, soumis_at desc);
create index if not exists qualite_reponses_enseignant_idx on public.qualite_reponses(enseignant_cle, soumis_at desc) where enseignant_cle is not null;
create index if not exists qualite_reponses_user_idx on public.qualite_reponses(user_id);
alter table public.qualite_reponses enable row level security;

create or replace function public.qualite_reponses_inalterables() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Une réponse d''enquête ne peut pas être supprimée (traçabilité Qualiopi).';
  end if;
  -- Seule l'anonymisation (suppression du compte) et le détachement de l'envoi
  -- sont admis.
  if (to_jsonb(new) - 'user_id' - 'envoi_id') is distinct from (to_jsonb(old) - 'user_id' - 'envoi_id')
     or (new.user_id is not null and new.user_id is distinct from old.user_id)
     or (new.envoi_id is not null and new.envoi_id is distinct from old.envoi_id) then
    raise exception 'Une réponse d''enquête ne peut pas être modifiée (traçabilité Qualiopi).';
  end if;
  return new;
end $$;
drop trigger if exists qualite_reponses_inalterables on public.qualite_reponses;
create trigger qualite_reponses_inalterables before update or delete on public.qualite_reponses
  for each row execute function public.qualite_reponses_inalterables();

-- --------------------------------------------------------------------------
-- Commentaires (§14-§16) : base unique ; texte original inaltérable ;
-- classification automatique (règles puis IA) corrigeable par l'administration.
-- --------------------------------------------------------------------------
create table if not exists public.qualite_commentaires (
  id                    uuid primary key default gen_random_uuid(),
  reponse_id            uuid references public.qualite_reponses(id) on delete set null,
  user_id               uuid references auth.users(id) on delete set null,
  famille               text not null,
  question_id           text,
  question_libelle      text,
  texte                 text not null check (char_length(texte) between 1 and 8000),
  note_associee         smallint,
  seance_id             uuid,
  enseignant_nom        text,
  enseignant_cle        text,
  colleges              text[] not null default '{}',
  voie                  text,
  promotion             text,
  contenu_type          text check (contenu_type in ('fiche','qcm','qroc','dossier','correction','annale','video','module','autre')),
  contenu_id            text,
  contenu_label         text,
  sentiment             text check (sentiment in ('positif','neutre','negatif','mixte')),
  sujet                 text,
  categories            text[] not null default '{}',
  theme_cle             text,
  theme_libelle         text,
  gravite               text check (gravite in ('faible','moyenne','elevee','critique')),
  demande_intervention  boolean not null default false,
  nature                text not null default 'remarque' check (nature in ('remarque','assistance','reclamation')),
  analyse_source        text check (analyse_source in ('regles','ia','manuel')),
  analyse_at            timestamptz,
  analyse_ia_at         timestamptz,
  analyse_ia_erreur     text,
  corrige_par           uuid references auth.users(id) on delete set null,
  corrige_at            timestamptz,
  reclamation_id        uuid,
  created_at            timestamptz not null default now()
);
create index if not exists qualite_commentaires_theme_idx on public.qualite_commentaires(theme_cle, created_at desc) where theme_cle is not null;
create index if not exists qualite_commentaires_sentiment_idx on public.qualite_commentaires(sentiment, created_at desc);
create index if not exists qualite_commentaires_ia_idx on public.qualite_commentaires(created_at) where analyse_ia_at is null;
create index if not exists qualite_commentaires_enseignant_idx on public.qualite_commentaires(enseignant_cle) where enseignant_cle is not null;
alter table public.qualite_commentaires enable row level security;

create or replace function public.qualite_commentaires_texte_original() returns trigger
language plpgsql as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Un commentaire de candidat ne peut pas être supprimé (traçabilité).';
  end if;
  if new.texte is distinct from old.texte or new.created_at is distinct from old.created_at
     or new.reponse_id is distinct from old.reponse_id and new.reponse_id is not null then
    raise exception 'Le texte original d''un commentaire ne peut pas être modifié.';
  end if;
  return new;
end $$;
drop trigger if exists qualite_commentaires_texte_original on public.qualite_commentaires;
create trigger qualite_commentaires_texte_original before update or delete on public.qualite_commentaires
  for each row execute function public.qualite_commentaires_texte_original();

-- --------------------------------------------------------------------------
-- Alertes (§21) : critique, vigilance, récurrence. Clé de déduplication.
-- --------------------------------------------------------------------------
create table if not exists public.qualite_alertes (
  id              uuid primary key default gen_random_uuid(),
  numero          bigint generated always as identity,
  niveau          text not null check (niveau in ('critique','vigilance','recurrence')),
  type            text not null,
  titre           text not null,
  detail          text,
  user_id         uuid references auth.users(id) on delete set null,
  seance_id       uuid,
  enseignant_cle  text,
  enseignant_nom  text,
  contenu_type    text,
  contenu_id      text,
  contenu_label   text,
  theme_cle       text,
  reponse_id      uuid,
  commentaire_id  uuid,
  donnees         jsonb not null default '{}'::jsonb,
  cle_dedup       text unique,
  statut          text not null default 'nouvelle' check (statut in ('nouvelle','en_cours','traitee','classee')),
  responsable_id  uuid references auth.users(id) on delete set null,
  traitee_par     uuid references auth.users(id) on delete set null,
  traitee_at      timestamptz,
  traitement      text,
  action_id       uuid,
  reclamation_id  uuid,
  email_envoye_at timestamptz,
  recap_at        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists qualite_alertes_statut_idx on public.qualite_alertes(statut, niveau, created_at desc);
create index if not exists qualite_alertes_user_idx on public.qualite_alertes(user_id) where user_id is not null;
alter table public.qualite_alertes enable row level security;

-- --------------------------------------------------------------------------
-- Suivi individuel (§10-§13) : difficultés détectées et interventions.
-- --------------------------------------------------------------------------
create table if not exists public.qualite_difficultes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  source       text not null check (source in ('enquete','resultats','progression','participation','inactivite','reclamation','manuel')),
  categorie    text,
  libelle      text not null check (char_length(libelle) between 1 and 300),
  detail       text,
  niveau       text not null default 'ponctuelle' check (niveau in ('ponctuelle','persistante','prioritaire')),
  statut       text not null default 'ouverte' check (statut in ('ouverte','en_cours','resolue','classee')),
  occurrences  int not null default 1,
  premiere_at  timestamptz not null default now(),
  derniere_at  timestamptz not null default now(),
  cle_dedup    text,
  reponse_id   uuid,
  alerte_id    uuid,
  resolue_at   timestamptz,
  resolue_par  uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index if not exists qualite_difficultes_ouverte_uidx
  on public.qualite_difficultes(user_id, cle_dedup) where cle_dedup is not null and statut in ('ouverte','en_cours');
create index if not exists qualite_difficultes_user_idx on public.qualite_difficultes(user_id, statut);
alter table public.qualite_difficultes enable row level security;

create table if not exists public.qualite_interventions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  difficulte_id       uuid references public.qualite_difficultes(id) on delete set null,
  alerte_id           uuid references public.qualite_alertes(id) on delete set null,
  signale_at          timestamptz,
  type                text not null default 'autre'
                        check (type in ('appel','email','message','seance_methodologie','ressource','rendez_vous','relance','autre')),
  action              text not null check (char_length(action) between 1 and 4000),
  traite_par          uuid references auth.users(id) on delete set null,
  traite_par_nom      text,
  statut              text not null default 'prevue' check (statut in ('prevue','realisee','annulee')),
  prevue_le           date,
  realisee_at         timestamptz,
  resultat            text,
  retour_demande      boolean not null default false,
  retour_candidat     text check (retour_candidat in ('utile','partiellement','pas_utile')),
  retour_commentaire  text,
  retour_at           timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists qualite_interventions_user_idx on public.qualite_interventions(user_id, created_at desc);
alter table public.qualite_interventions enable row level security;

-- --------------------------------------------------------------------------
-- Actions correctives (§23-§24) et vérifications de contenu (§19-§20).
-- --------------------------------------------------------------------------
create table if not exists public.qualite_actions (
  id                        uuid primary key default gen_random_uuid(),
  numero                    bigint generated always as identity,
  titre                     text not null check (char_length(titre) between 1 and 300),
  probleme                  text not null,
  cause                     text,
  action_decidee            text,
  responsable_id            uuid references auth.users(id) on delete set null,
  responsable_nom           text,
  echeance                  date,
  statut                    text not null default 'nouveau'
                              check (statut in ('nouveau','en_analyse','action_decidee','en_cours','realise','efficacite_a_verifier','cloture','sans_suite')),
  justification_sans_suite  text,
  realisee_at               timestamptz,
  cible_type                text not null default 'global'
                              check (cible_type in ('enseignant','seance','contenu','theme','plateforme','organisation','global')),
  cible_cle                 text,
  cible_label               text,
  theme_cle                 text,
  date_reference            timestamptz,
  mesure_avant              jsonb,
  mesure_apres              jsonb,
  mesure_at                 timestamptz,
  efficacite_constat        text,
  efficace                  boolean,
  cloture_par               uuid references auth.users(id) on delete set null,
  cloture_at                timestamptz,
  created_by                uuid references auth.users(id) on delete set null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create index if not exists qualite_actions_statut_idx on public.qualite_actions(statut, echeance);
alter table public.qualite_actions enable row level security;

create table if not exists public.qualite_verifications (
  id               uuid primary key default gen_random_uuid(),
  numero           bigint generated always as identity,
  nature           text not null default 'erreur' check (nature in ('erreur','actualisation','imprecision','autre')),
  contenu_type     text not null default 'autre' check (contenu_type in ('fiche','qcm','qroc','dossier','correction','annale','video','module','autre')),
  contenu_id       text,
  contenu_label    text not null check (char_length(contenu_label) between 1 and 300),
  demande          text not null,
  source_citee     text,
  responsable_id   uuid references auth.users(id) on delete set null,
  responsable_nom  text,
  statut           text not null default 'a_verifier' check (statut in ('a_verifier','en_verification','decide','mis_a_jour','classe')),
  decision         text check (decision in ('fondee','non_fondee','partiellement_fondee')),
  decision_detail  text,
  verifiee_at      timestamptz,
  mise_a_jour_at   timestamptz,
  version_corrigee text,
  signalements     int not null default 1,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists qualite_verifications_statut_idx on public.qualite_verifications(statut, created_at desc);
alter table public.qualite_verifications enable row level security;

-- Associations entre objets (action ↔ alertes, commentaires, réclamations ;
-- vérification ↔ commentaires ; réclamation ↔ commentaire…).
create table if not exists public.qualite_liens (
  de_type    text not null check (de_type in ('action','verification','reclamation','alerte')),
  de_id      text not null,
  vers_type  text not null check (vers_type in ('alerte','commentaire','reclamation','reponse','verification','action','difficulte')),
  vers_id    text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (de_type, de_id, vers_type, vers_id)
);
create index if not exists qualite_liens_vers_idx on public.qualite_liens(vers_type, vers_id);
alter table public.qualite_liens enable row level security;

-- Documents justificatifs (§23) : fichier du seau privé `qualite` ou lien.
create table if not exists public.qualite_documents (
  id          uuid primary key default gen_random_uuid(),
  objet_type  text not null check (objet_type in ('action','verification','reclamation','intervention')),
  objet_id    text not null,
  nom         text not null,
  chemin      text,
  url         text,
  taille      int,
  mime        text,
  ajoute_par  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (chemin is not null or url is not null)
);
create index if not exists qualite_documents_objet_idx on public.qualite_documents(objet_type, objet_id);
alter table public.qualite_documents enable row level security;

insert into storage.buckets (id, name, public)
values ('qualite', 'qualite', false)
on conflict (id) do nothing;

-- --------------------------------------------------------------------------
-- Journal de traçabilité (append-only) : envois, réponses, neutralisations,
-- dispenses, corrections de classification, alertes, actions, paramètres…
-- --------------------------------------------------------------------------
create table if not exists public.qualite_journal (
  id          bigint generated always as identity primary key,
  objet_type  text not null,
  objet_id    text,
  action      text not null,
  user_id     uuid,              -- candidat concerné (pas de clé étrangère : la trace survit)
  auteur_id   uuid,
  auteur_nom  text,
  details     jsonb not null default '{}'::jsonb,
  at          timestamptz not null default now()
);
create index if not exists qualite_journal_objet_idx on public.qualite_journal(objet_type, objet_id, at desc);
create index if not exists qualite_journal_user_idx on public.qualite_journal(user_id, at desc) where user_id is not null;
create index if not exists qualite_journal_at_idx on public.qualite_journal(at desc);
alter table public.qualite_journal enable row level security;

create or replace function public.qualite_journal_ajout_seul() returns trigger
language plpgsql as $$
begin
  raise exception 'Le journal qualité est en ajout seul.';
end $$;
drop trigger if exists qualite_journal_ajout_seul on public.qualite_journal;
create trigger qualite_journal_ajout_seul before update or delete on public.qualite_journal
  for each row execute function public.qualite_journal_ajout_seul();

-- --------------------------------------------------------------------------
-- Réclamations (§22) : registre UNIQUE partagé avec le cockpit administrateur
-- (`cockpit_reclamations`). On y ajoute l'origine qualité, le motif, la
-- décision et la date de clôture. Garde : la table peut ne pas exister.
-- --------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.cockpit_reclamations') is not null then
    alter table public.cockpit_reclamations add column if not exists origine text not null default 'cockpit';
    alter table public.cockpit_reclamations add column if not exists commentaire_id uuid;
    alter table public.cockpit_reclamations add column if not exists reponse_id uuid;
    alter table public.cockpit_reclamations add column if not exists motif text;
    alter table public.cockpit_reclamations add column if not exists decision text;
    alter table public.cockpit_reclamations add column if not exists cloturee_at timestamptz;
    alter table public.cockpit_reclamations add column if not exists qualite_action_id uuid;
  end if;
end $$;

-- Inactivité (§12) : la dernière activité pédagogique est lue par la RPC
-- existante `admin_activity_snapshot()` (agrégat SQL, service-role).
