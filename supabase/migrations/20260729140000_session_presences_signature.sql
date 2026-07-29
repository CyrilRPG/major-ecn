-- =============================================
-- Signature manuscrite des émargements de sessions Zoom
--
-- L'émargement Zoom se limitait à une case à cocher. Il porte désormais une
-- signature manuscrite, comme les vidéos de la plateforme, afin que les deux
-- origines aient la même valeur probatoire dans un dossier de formation.
--
-- Colonne nullable : les émargements antérieurs (le cas échéant) restent
-- lisibles sans signature.
-- =============================================

alter table public.session_presences
  add column signature_png text;

comment on column public.session_presences.signature_png is
  'Signature manuscrite (data URL image/png) apposée avant l''ouverture du lien Zoom.';
