-- Audit des corrigés QCM : cohérence clé (is_correct) ↔ justification.
--
-- Origine : signalement d'un élève (06/09/2026) sur le DP Gériatrie 8 de
-- « Facteurs de risque cardio-vasculaire et prévention » — une proposition
-- affichée « Erreur — à ne pas cocher » alors que sa propre justification la
-- donnait pour vraie. Un premier passage déterministe (justifications qui
-- commencent par « Vrai »/« Faux ») a trouvé 11 incohérences sur 371 385
-- propositions ; 316 000 justifications n'ont pas de marqueur explicite et ne
-- peuvent être contrôlées qu'en les LISANT. C'est ce que fait l'outil
-- « Administration › Audit des corrigés » : chaque question (énoncé,
-- propositions, clés, justifications) est soumise par lots à un modèle qui
-- relève les propositions dont la clé contredit la justification, via l'API
-- Batch (asynchrone, moitié prix). Les constats sont relus et corrigés ici.
--
-- Second type de passage (`kind = 'justifications'`) : 7 771 propositions ont
-- une justification RECOPIÉE de leur énoncé et 7 384 une justification vide
-- (mesuré le 06/09/2026, presque toutes dans la banque de DP Gériatrie). Le
-- modèle rédige alors une justification cohérente avec la clé, stockée dans
-- `proposition` ; l'admin l'applique (une par une ou toutes d'un coup).
--
-- À APPLIQUER À LA MAIN dans l'éditeur SQL Supabase.

create table if not exists public.qcm_audit_runs (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  -- Périmètre : un collège (matieres.id) ou toute la plateforme (null).
  college_id text,
  college_nom text,
  model text not null,
  -- 'coherence' : clé ↔ justification ; 'justifications' : rédaction des justifications vides ou recopiées.
  kind text not null default 'coherence' check (kind in ('coherence', 'justifications')),
  status text not null default 'preparation'
    check (status in ('preparation', 'en_cours', 'termine', 'echec', 'annule')),
  -- Lots Anthropic (Message Batches) : [{ id, college_id, requests, collected, ended, errored }]
  batches jsonb not null default '[]'::jsonb,
  -- Colleges restant à soumettre (le lancement est reprenable) : [college_id]
  restants jsonb not null default '[]'::jsonb,
  nb_questions integer not null default 0,
  nb_items integer not null default 0,
  nb_requetes integer not null default 0,
  nb_constats integer not null default 0,
  cout_estime_usd numeric(10,4),
  cout_usd numeric(10,4) not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists public.qcm_audit_findings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.qcm_audit_runs(id) on delete cascade,
  item_id uuid not null references public.qcm_items(id) on delete cascade,
  question_id uuid not null references public.qcm_questions(id) on delete cascade,
  cours_id uuid references public.cours(id) on delete set null,
  college_id text,
  lettre text not null,
  is_correct_actuel boolean not null,
  -- Ce que la justification affirme d'après le modèle : 'vrai' | 'faux' | 'indeterminee'
  polarite_justification text not null,
  -- 'incoherent' : clé contredite par la justification ; 'douteux' : justification muette ou ambiguë
  -- 'justification' : proposition de rédaction (passage `justifications`).
  gravite text not null check (gravite in ('incoherent', 'douteux', 'justification')),
  motif text,
  -- Justification rédigée par le modèle, à appliquer (passage `justifications`).
  proposition text,
  -- Copie au moment de l'audit, pour relire même si le contenu bouge ensuite.
  enonce_question text,
  enonce_item text,
  justification text,
  statut text not null default 'ouvert' check (statut in ('ouvert', 'cle_inversee', 'ignore', 'corrige_manuellement', 'proposition_appliquee')),
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (run_id, item_id)
);

create index if not exists qcm_audit_findings_run_statut_idx on public.qcm_audit_findings(run_id, statut, gravite);
create index if not exists qcm_audit_findings_item_idx on public.qcm_audit_findings(item_id);

alter table public.qcm_audit_runs enable row level security;
alter table public.qcm_audit_findings enable row level security;

drop policy if exists qcm_audit_runs_admin on public.qcm_audit_runs;
create policy qcm_audit_runs_admin on public.qcm_audit_runs
  for all to authenticated
  using ((select public.current_role()) = 'admin')
  with check ((select public.current_role()) = 'admin');

drop policy if exists qcm_audit_findings_admin on public.qcm_audit_findings;
create policy qcm_audit_findings_admin on public.qcm_audit_findings
  for all to authenticated
  using ((select public.current_role()) = 'admin')
  with check ((select public.current_role()) = 'admin');
