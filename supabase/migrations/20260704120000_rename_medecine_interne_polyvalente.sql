-- Renomme « Médecine interne » → « Médecine interne polyvalente » côté plateforme
-- pédagogique (le site vitrine est mis à jour directement dans le code).
--
-- Idempotent : n'affecte que les lignes dont le libellé est EXACTEMENT
-- « Médecine interne » (0 ligne si l'entité n'existe pas encore). « Médecine
-- interne polyvalente » n'est pas re-renommé grâce au filtre d'égalité stricte.

-- Remplacement du terme « Médecine interne » → « Médecine interne polyvalente »
-- partout où il apparaît (y compris « Révisions - Médecine interne »), sans
-- jamais re-renommer un libellé déjà « polyvalente ».

-- Matières (collèges/matières du menu de gauche)
update public.matieres
   set nom = replace(nom, 'Médecine interne', 'Médecine interne polyvalente')
 where nom ilike '%médecine interne%' and nom not ilike '%polyvalente%';

-- Cours
update public.cours
   set titre = replace(titre, 'Médecine interne', 'Médecine interne polyvalente')
 where titre ilike '%médecine interne%' and titre not ilike '%polyvalente%';

-- Facultés (« collèges » de premier niveau selon l'organisation)
update public.facultes
   set nom = replace(nom, 'Médecine interne', 'Médecine interne polyvalente')
 where nom ilike '%médecine interne%' and nom not ilike '%polyvalente%';
