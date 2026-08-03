-- « Médecine Intensive-Réanimation » → « Médecine d'urgence »
-- ---------------------------------------------------------------------------
-- Le collège `col-mir` était déjà commercialisé sous le nom « Médecine
-- d'urgence » (cf. APPROFONDI_SPECIALTIES, clé `medecine-urgence`) alors que la
-- plateforme et le tunnel d'achat affichaient encore l'ancien libellé. On
-- aligne le libellé sur le nom commercial.
--
-- L'IDENTIFIANT ne change pas (`col-mir`) : il est référencé par les
-- permissions des élèves (`permission_scope.colleges`), les métadonnées Stripe
-- et le catalogue d'offres. Seul l'affichage bouge.
--
-- Non concerné : le sous-collège `col-mg-reanimation` (« Réanimation »), qui est
-- un module du programme de médecine générale — pas la spécialité.

update public.matieres
set nom = 'Médecine d’urgence', updated_at = now()
where id = 'col-mir' and nom <> 'Médecine d’urgence';

update public.cours
set titre = 'Introduction à la médecine d’urgence', updated_at = now()
where matiere_id = 'col-mir'
  and titre ilike 'Introduction à la médecine intensive%';

update public.fiches f
set titre = 'Introduction à la médecine d’urgence', updated_at = now()
from public.cours c
where c.id = f.cours_id
  and c.matiere_id = 'col-mir'
  and f.titre ilike 'Introduction à la médecine intensive%';
