-- =============================================================================
-- Migration : enrichir profiles avec les champs administratifs des enseignants
--             (adresse + documents : CV, certificat de scolarité, carte pro).
-- =============================================================================

alter table public.profiles
  add column if not exists address text,
  add column if not exists cv_url text,
  add column if not exists certificat_scolarite_url text,
  add column if not exists carte_pro_url text;

comment on column public.profiles.address is
  'Adresse postale (champ libre, surtout pour les profils enseignants).';
comment on column public.profiles.cv_url is
  'URL du CV (PDF) — stocké dans un bucket Supabase storage public restreint à l''admin.';
comment on column public.profiles.certificat_scolarite_url is
  'URL du certificat de scolarité (pour les internes en formation).';
comment on column public.profiles.carte_pro_url is
  'URL de la carte professionnelle ou justificatif d''exercice (praticiens).';
