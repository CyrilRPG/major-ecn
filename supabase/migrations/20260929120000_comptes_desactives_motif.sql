-- ============================================================================
-- Comptes désactivés : motif + blocage RLS (29/09/2026)
--
-- 1. Motif de désactivation, saisi par l'administrateur (« paiement » ou
--    « autre », note libre facultative), avec la date et l'auteur. Remis à
--    NULL à la réactivation.
-- 2. `access_expired()` renvoie aussi VRAI pour un compte désactivé. Toutes les
--    policies RESTRICTIVE `*_not_expired` (cours, matieres, semestres, fiches,
--    videos, qcm_series, qcm_questions, flashcards) ferment donc le contenu à un
--    compte désactivé, même si son jeton d'accès n'a pas encore expiré.
--    Jusqu'ici `is_active` n'était lu que par l'application : un jeton encore
--    valide lisait tout le contenu en direct.
-- ============================================================================

alter table public.profiles
  add column if not exists deactivation_reason text,
  add column if not exists deactivation_note text,
  add column if not exists deactivated_at timestamptz,
  add column if not exists deactivated_by uuid references auth.users(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_deactivation_reason_check'
  ) then
    alter table public.profiles
      add constraint profiles_deactivation_reason_check
      check (deactivation_reason is null or deactivation_reason in ('paiement', 'autre'));
  end if;
end $$;

comment on column public.profiles.deactivation_reason is
  'Motif de désactivation saisi par un admin : paiement | autre (NULL = non précisé ou compte actif).';
comment on column public.profiles.deactivation_note is
  'Précision libre sur la désactivation (facultative).';

create or replace function public.access_expired()
returns boolean
language sql
stable security definer
set search_path to 'public'
as $function$
  select coalesce((select p.is_active = false from public.profiles p where p.id = auth.uid()), false)
      or coalesce(public.effective_access_end(auth.uid()) < now(), false);
$function$;
