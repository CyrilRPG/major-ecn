-- Renomme « Médecine interne » → « Médecine interne polyvalente » côté plateforme
-- pédagogique (le site vitrine est mis à jour directement dans le code).
--
-- Idempotent : n'affecte que les lignes dont le libellé est EXACTEMENT
-- « Médecine interne » (0 ligne si l'entité n'existe pas encore). « Médecine
-- interne polyvalente » n'est pas re-renommé grâce au filtre d'égalité stricte.

-- Matières (collèges/matières du menu de gauche)
update public.matieres
   set nom = 'Médecine interne polyvalente'
 where nom = 'Médecine interne';

-- Cours
update public.cours
   set titre = 'Médecine interne polyvalente'
 where titre = 'Médecine interne';

-- Facultés (« collèges » de premier niveau selon l'organisation)
update public.facultes
   set nom = 'Médecine interne polyvalente'
 where nom = 'Médecine interne';
