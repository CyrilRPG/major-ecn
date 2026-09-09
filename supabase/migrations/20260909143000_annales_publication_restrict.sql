-- Une liste de formules vide retire explicitement la série de la publication.
-- Le contrôle porte sur toutes les séries, y compris les annales : l'ancienne
-- restriction de formules ne concernait que les entraînements.
-- Les questions et propositions héritent de cette règle via leurs politiques
-- de lecture. Aucun historique étudiant ni contenu éditorial n'est supprimé.
drop policy if exists qcm_series_publication_restrict on public.qcm_series;

create policy qcm_series_publication_restrict
on public.qcm_series
as restrictive
for select
to public
using (
  (select public.current_role()) is distinct from 'student'
  or allowed_offers is distinct from '{}'::text[]
);

comment on policy qcm_series_publication_restrict on public.qcm_series is
  'allowed_offers = {} retire la série pour les étudiants ; NULL conserve les règles normales. Lecture éditoriale et historique conservés.';
