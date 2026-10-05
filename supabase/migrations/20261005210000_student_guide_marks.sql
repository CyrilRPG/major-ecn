-- Repères du guide élève (05/10/2026) : rubriques déjà ouvertes (« vu:<rubrique> »)
-- et choix d'interface durables (« bien-demarrer:masque »). Sert à la carte
-- « Bien démarrer » de l'accueil et, plus tard, à mesurer l'usage des rubriques.
-- Écriture : uniquement côté serveur (clé de service, action noterRepereAction) ;
-- lecture : l'élève voit ses propres repères.

create table if not exists public.student_guide_marks (
  user_id uuid not null references auth.users(id) on delete cascade,
  cle text not null check (cle ~ '^[a-z0-9:-]{3,60}$'),
  first_at timestamptz not null default now(),
  last_at timestamptz not null default now(),
  primary key (user_id, cle)
);

alter table public.student_guide_marks enable row level security;

drop policy if exists student_guide_marks_select_own on public.student_guide_marks;
create policy student_guide_marks_select_own on public.student_guide_marks
  for select to authenticated using (user_id = auth.uid());

comment on table public.student_guide_marks is 'Repères du guide élève : rubriques ouvertes (vu:<rubrique>), carte « Bien démarrer » masquée. Écriture service-role uniquement.';
