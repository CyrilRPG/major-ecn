-- Permission individuelle de téléchargement des fichiers (fiches PDF…).
-- Par défaut FALSE : seuls les admins téléchargent. L'admin peut l'activer
-- pour un professeur ou un élève (client) donné.
alter table public.profiles
  add column if not exists can_download boolean not null default false;

comment on column public.profiles.can_download is
  'Autorise cet utilisateur (prof ou élève) à télécharger les fichiers. Admin = toujours autorisé.';
