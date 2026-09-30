-- ============================================================================
-- Vidéo de présentation (« visite guidée ») — suivi des trois indicateurs
-- demandés par le client (brief du 30/09/2026, point C) :
--   1. clics sur Play (par source) ;
--   2. taux de visionnage complet = visiteurs « complete » / visiteurs « play » ;
--   3. taux d'inscription à l'espace découverte APRÈS visionnage
--      = visiteurs « signup » / visiteurs « play ».
--
-- `visitor_id` : UUID aléatoire tiré par le navigateur (localStorage
-- `mecn_video_visitor`). AUCUNE donnée personnelle : ni e-mail, ni IP, ni
-- identifiant de compte. Écriture par la route publique
-- /api/marketing/video-event (service-role) ; aucune lecture publique.
-- Migration ADDITIVE.
-- ============================================================================

create table if not exists public.marketing_video_events (
  id bigint generated always as identity primary key,
  visitor_id text not null check (char_length(visitor_id) between 8 and 64),
  event text not null check (event in (
    'play_click', 'play', 'progress_25', 'progress_50', 'progress_75', 'complete', 'end_cta_click', 'signup'
  )),
  source text check (source is null or source in ('hero_image', 'hero_button', 'page', 'page_email')),
  path text check (path is null or char_length(path) <= 300),
  created_at timestamptz not null default now()
);

create index if not exists marketing_video_events_created_idx on public.marketing_video_events (created_at);
create index if not exists marketing_video_events_visitor_idx on public.marketing_video_events (visitor_id, event);

alter table public.marketing_video_events enable row level security;
-- Aucune politique : ni lecture ni écriture pour anon / authenticated.
-- Seul le service-role (route d'ingestion, tableau de bord admin) y accède.
