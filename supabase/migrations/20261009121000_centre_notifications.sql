-- ════════════════════════════════════════════════════════════════════════
-- CENTRE DE NOTIFICATIONS — module transversal de la plateforme (CDC Major
-- ECN, « Mes notifications »). Relié aux Échanges, aux cours, à l'agenda et
-- aux contenus pédagogiques.
--
--  · notification_preferences : choix de l'élève, enregistrés côté serveur
--    (identiques sur tous ses appareils) — deux canaux indépendants par
--    catégorie (application / e-mail) + mode d'envoi des e-mails (immédiat ou
--    récapitulatif du soir).
--  · notification_emails : boîte d'envoi des e-mails (immédiats et
--    récapitulatifs), une clé unique par notification (pas de doublon).
--  · notification_contenus : contenus déjà annoncés (idempotence du balayage
--    des nouveaux contenus : vidéos, supports, QCM, dossiers, épreuves).
--  · notification_reglages : interrupteurs administratifs par catégorie.
--  · notification_appareils : jetons des appareils (préparation des
--    notifications push, §93) — non utilisés tant que le fournisseur n'est pas
--    configuré.
--
-- La cloche (pedago_notifications) reste le centre de notifications interne.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.notification_preferences (
  user_id uuid primary key,
  app_actif boolean not null default true,
  email_actif boolean not null default true,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  categorie text not null,
  cle text not null unique,
  titre text not null,
  corps text,
  lien text,
  mode text not null default 'immediat' check (mode in ('immediat', 'quotidien', 'prioritaire')),
  statut text not null default 'a_envoyer' check (statut in ('a_envoyer', 'envoyee', 'echec', 'annulee', 'simulee')),
  tentatives integer not null default 0,
  erreur text,
  verrou_at timestamptz,
  lot_id uuid,
  created_at timestamptz not null default now(),
  envoyee_at timestamptz
);
create index if not exists notification_emails_file_idx on public.notification_emails (mode, created_at) where statut = 'a_envoyer';
create index if not exists notification_emails_user_idx on public.notification_emails (user_id, created_at desc);

create table if not exists public.notification_contenus (
  type_contenu text not null,
  contenu_id text not null,
  categorie text not null,
  annonce_at timestamptz not null default now(),
  destinataires integer not null default 0,
  primary key (type_contenu, contenu_id, categorie)
);

create table if not exists public.notification_reglages (
  id smallint primary key default 1 check (id = 1),
  pause_globale boolean not null default false,
  -- Envoi automatique par catégorie de contenu (balayage des nouveautés).
  auto_video boolean not null default true,
  auto_support boolean not null default true,
  auto_qcm boolean not null default true,
  auto_cases boolean not null default true,
  auto_exam boolean not null default true,
  auto_live boolean not null default true,
  -- Regroupement : on attend que l'ajout soit « calme » depuis N minutes avant
  -- d'annoncer (40 QCM importés d'affilée = UNE notification).
  regroupement_minutes integer not null default 10 check (regroupement_minutes between 0 and 240),
  -- Contenus antérieurs à ce repère : jamais annoncés (évite d'annoncer tout
  -- le catalogue au premier passage).
  depuis timestamptz not null default now(),
  rappel_live_minutes integer not null default 60 check (rappel_live_minutes between 5 and 1440),
  digest_heure integer not null default 18 check (digest_heure between 0 and 23),
  dernier_digest_jour date,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
insert into public.notification_reglages (id) values (1) on conflict (id) do nothing;

create table if not exists public.notification_appareils (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plateforme text not null check (plateforme in ('ios', 'android', 'web')),
  jeton text not null unique,
  created_at timestamptz not null default now(),
  derniere_vue_at timestamptz not null default now()
);
create index if not exists notification_appareils_user_idx on public.notification_appareils (user_id);

-- Réservation atomique des e-mails à envoyer (cron concurrent, retry).
create or replace function public.notification_emails_reserver(p_mode text, p_limite integer default 200, p_jusqua timestamptz default now())
returns setof public.notification_emails
language plpgsql as $$
begin
  return query
  with candidats as (
    select e.id from public.notification_emails e
     where e.statut = 'a_envoyer' and e.mode = p_mode and e.created_at <= p_jusqua
       and (e.verrou_at is null or e.verrou_at < now() - interval '10 minutes')
     order by e.user_id, e.created_at
     limit p_limite
     for update skip locked
  )
  update public.notification_emails e
     set verrou_at = now(), tentatives = e.tentatives + 1
    from candidats c
   where e.id = c.id
  returning e.*;
end $$;

-- Rappel des séances en direct : cles uniques dans pedago_notifications
-- (group_key) garantissent un seul rappel par séance et par élève.

do $$
declare t text;
begin
  foreach t in array array['notification_preferences', 'notification_emails', 'notification_contenus', 'notification_reglages', 'notification_appareils'] loop
    execute format('alter table public.%I enable row level security', t);
    begin
      execute format('revoke all on public.%I from anon, authenticated', t);
    exception when undefined_object then null;
    end;
  end loop;
end $$;

do $$
begin
  revoke execute on function public.notification_emails_reserver(text, integer, timestamptz) from public;
  grant execute on function public.notification_emails_reserver(text, integer, timestamptz) to service_role;
exception when undefined_object then null;
end $$;
