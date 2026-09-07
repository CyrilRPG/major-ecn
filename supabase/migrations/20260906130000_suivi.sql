-- =====================================================================
-- Module de suivi pédagogique individuel (cahier des charges V4, 09/2026)
-- ---------------------------------------------------------------------
-- Campagnes de suivi, planification libre, créneaux, réservation candidat,
-- comptes rendus (difficultés → actions), alertes administrateur, modèles
-- d'emails, historique et exports. Tables cloisonnées par faculté.
-- Sans risque à relancer (if not exists / drop policy if exists).
-- =====================================================================

-- Réglages du module (une ligne par faculté)
create table if not exists public.suivi_settings (
  faculte_id            text primary key default 'major-ecn',
  default_slot_minutes  int not null default 10 check (default_slot_minutes between 5 and 180),
  buffer_minutes        int not null default 0 check (buffer_minutes between 0 and 60),
  reminder_hours        int not null default 24 check (reminder_hours between 1 and 168),
  retention_months      int not null default 36 check (retention_months >= 1),
  alert_email           text,
  deletion_policy       text not null default 'anonymize' check (deletion_policy in ('delete','anonymize')),
  specialty_colors      jsonb not null default '{}'::jsonb,
  updated_at            timestamptz not null default now()
);
insert into public.suivi_settings (faculte_id) values ('major-ecn') on conflict (faculte_id) do nothing;

-- Droits du module (§18) : l'administrateur a tout ; les autres rôles sont
-- accordés nominativement à des comptes staff (professeurs).
create table if not exists public.suivi_staff_roles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  faculte_id  text not null default 'major-ecn',
  role        text not null check (role in ('responsable','intervenant','lecture')),
  created_at  timestamptz not null default now()
);

-- Campagnes (§2)
create table if not exists public.suivi_campaigns (
  id              uuid primary key default gen_random_uuid(),
  faculte_id      text not null default 'major-ecn',
  name            text not null,
  description     text not null default '',
  status          text not null default 'draft' check (status in ('draft','active','closed')),
  specialties     text[] not null default '{}'::text[],
  offers          text[] not null default '{}'::text[],
  voies           text[] not null default '{}'::text[],
  evc_session_id  text references public.evc_sessions(id) on delete set null,
  selection_mode  text not null default 'all' check (selection_mode in ('all','followed','never_followed','manual')),
  manual_user_ids uuid[] not null default '{}'::uuid[],
  period_start    date,
  period_end      date,
  slot_minutes    int check (slot_minutes is null or slot_minutes between 5 and 180),
  announced_at    timestamptz,
  invited_at      timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Candidats ciblés par une campagne et leur état (§10, §14)
create table if not exists public.suivi_campaign_members (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references public.suivi_campaigns(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  status            text not null default 'targeted'
    check (status in ('targeted','invited','booked','done','no_show','to_recall','unreachable','cancelled')),
  invited_at        timestamptz,
  last_reminder_at  timestamptz,
  reminder_count    int not null default 0,
  created_at        timestamptz not null default now(),
  unique (campaign_id, user_id)
);
create index if not exists suivi_campaign_members_user_idx on public.suivi_campaign_members(user_id);

-- Créneaux (§6) — générés depuis une plage, capacité > 1 si plusieurs collaborateurs
create table if not exists public.suivi_slots (
  id             uuid primary key default gen_random_uuid(),
  faculte_id     text not null default 'major-ecn',
  campaign_id    uuid references public.suivi_campaigns(id) on delete set null,
  starts_at      timestamptz not null,
  ends_at        timestamptz not null,
  capacity       int not null default 1 check (capacity >= 1),
  staff_user_id  uuid references auth.users(id) on delete set null,
  status         text not null default 'open' check (status in ('open','blocked')),
  note           text,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists suivi_slots_starts_idx on public.suivi_slots(starts_at);

-- Rendez-vous (§7, §8, §14)
create table if not exists public.suivi_appointments (
  id                uuid primary key default gen_random_uuid(),
  faculte_id        text not null default 'major-ecn',
  slot_id           uuid references public.suivi_slots(id) on delete set null,
  campaign_id       uuid references public.suivi_campaigns(id) on delete set null,
  user_id           uuid not null references auth.users(id) on delete cascade,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  status            text not null default 'planned'
    check (status in ('planned','done','no_show','cancelled','to_recall','postponed')),
  booked_at         timestamptz not null default now(),
  booked_by         text not null default 'admin' check (booked_by in ('student','admin')),
  booked_by_user    uuid references auth.users(id) on delete set null,
  moved_from        uuid references public.suivi_appointments(id) on delete set null,
  staff_user_id     uuid references auth.users(id) on delete set null,
  reminder_hours    int check (reminder_hours is null or reminder_hours between 1 and 168),
  reminder_sent_at  timestamptz,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists suivi_appointments_user_idx on public.suivi_appointments(user_id, starts_at desc);
create index if not exists suivi_appointments_starts_idx on public.suivi_appointments(starts_at);
create index if not exists suivi_appointments_slot_idx on public.suivi_appointments(slot_id) where status in ('planned','to_recall','postponed');

-- Comptes rendus (§12) → difficultés (§12.1) → actions (§12.3)
create table if not exists public.suivi_reports (
  id              uuid primary key default gen_random_uuid(),
  faculte_id      text not null default 'major-ecn',
  user_id         uuid not null references auth.users(id) on delete cascade,
  appointment_id  uuid references public.suivi_appointments(id) on delete set null,
  author_id       uuid references auth.users(id) on delete set null,
  occurred_at     timestamptz not null default now(),
  contact_type    text not null default 'rendez_vous'
    check (contact_type in ('rendez_vous','telephone','visio','email','whatsapp')),
  summary         text not null default '',
  internal_notes  text,
  next_step       text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists suivi_reports_user_idx on public.suivi_reports(user_id, occurred_at desc);

create table if not exists public.suivi_difficulties (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.suivi_reports(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  category    text not null check (category in (
    'qcm','qroc','cas_cliniques','methodologie','connaissances','organisation','manque_de_temps',
    'retard_programme','utilisation_plateforme','comprehension_contenu','autre')),
  details     text not null default '',
  no_action   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists suivi_difficulties_user_idx on public.suivi_difficulties(user_id);

create table if not exists public.suivi_actions (
  id             uuid primary key default gen_random_uuid(),
  report_id      uuid references public.suivi_reports(id) on delete set null,
  user_id        uuid not null references auth.users(id) on delete cascade,
  difficulty_id  uuid references public.suivi_difficulties(id) on delete set null,
  category       text not null check (category in (
    'contact_enseignant','verification_contenu','contenus_prioritaires','exercices_cibles',
    'revision_methodologique','adaptation_planning','evaluation_complementaire','nouveau_rendez_vous',
    'assistance_technique','autre')),
  comment        text not null default '',
  owner_id       uuid references auth.users(id) on delete set null,
  due_date       date,
  status         text not null default 'todo' check (status in ('todo','in_progress','done','na')),
  done_at        timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists suivi_actions_user_idx on public.suivi_actions(user_id, status);
create index if not exists suivi_actions_due_idx on public.suivi_actions(due_date) where status in ('todo','in_progress');

-- Alertes administrateur (§4) — persistantes jusqu'à traitement
create table if not exists public.suivi_alerts (
  id               uuid primary key default gen_random_uuid(),
  faculte_id       text not null default 'major-ecn',
  title            text not null,
  note             text not null default '',
  due_at           timestamptz not null,
  campaign_id      uuid references public.suivi_campaigns(id) on delete set null,
  recipient_email  text,
  owner_id         uuid references auth.users(id) on delete set null,
  status           text not null default 'open' check (status in ('open','done','postponed','closed')),
  emailed_at       timestamptz,
  created_by       uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists suivi_alerts_due_idx on public.suivi_alerts(due_at) where status in ('open','postponed');

-- Bibliothèque d'emails (§15) — modifiables, variables {{prenom}} {{specialite}} {{date}} {{heure}} {{lien}}
create table if not exists public.suivi_email_templates (
  id          uuid primary key default gen_random_uuid(),
  faculte_id  text not null default 'major-ecn',
  key         text not null,
  name        text not null,
  subject     text not null,
  body        text not null,
  updated_at  timestamptz not null default now(),
  unique (faculte_id, key)
);

-- Historique (§11, §14) : invitations, relances, envois, déplacements, tentatives de contact
create table if not exists public.suivi_history (
  id              uuid primary key default gen_random_uuid(),
  faculte_id      text not null default 'major-ecn',
  user_id         uuid references auth.users(id) on delete cascade,
  campaign_id     uuid references public.suivi_campaigns(id) on delete set null,
  appointment_id  uuid references public.suivi_appointments(id) on delete set null,
  kind            text not null,
  payload         jsonb not null default '{}'::jsonb,
  actor_id        uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists suivi_history_user_idx on public.suivi_history(user_id, created_at desc);

-- Liens sécurisés de réservation (§7)
create table if not exists public.suivi_booking_tokens (
  id           uuid primary key default gen_random_uuid(),
  faculte_id   text not null default 'major-ecn',
  user_id      uuid not null references auth.users(id) on delete cascade,
  campaign_id  uuid references public.suivi_campaigns(id) on delete cascade,
  token_hash   text not null unique,
  expires_at   timestamptz not null,
  used_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- updated_at automatique
create or replace function public.suivi_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
declare t text;
begin
  foreach t in array array['suivi_campaigns','suivi_appointments','suivi_reports','suivi_actions','suivi_alerts','suivi_email_templates','suivi_settings']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.suivi_touch_updated_at()', t, t);
  end loop;
end $$;

-- RLS : administration par défaut ; l'élève lit ses propres rendez-vous.
do $$
declare t text;
begin
  foreach t in array array['suivi_settings','suivi_staff_roles','suivi_campaigns','suivi_campaign_members','suivi_slots',
                           'suivi_appointments','suivi_reports','suivi_difficulties','suivi_actions','suivi_alerts',
                           'suivi_email_templates','suivi_history','suivi_booking_tokens']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I_admin_all on public.%I', t, t);
    execute format('create policy %I_admin_all on public.%I for all using (public.current_role() = ''admin'') with check (public.current_role() = ''admin'')', t, t);
  end loop;
end $$;

drop policy if exists suivi_appointments_self_read on public.suivi_appointments;
create policy suivi_appointments_self_read on public.suivi_appointments
  for select using (user_id = auth.uid());
