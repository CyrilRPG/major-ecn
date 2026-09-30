/* ============================================================
   Liens éditoriaux du calendrier EVC.

   Les DONNÉES (dates d'épreuve, inscriptions, postes par spécialité)
   ne vivent plus ici : elles sont dans la table `evc_calendrier`,
   éditable depuis /admin/calendrier-evc, et lues par
   `chargerCalendrierEvc()` (src/lib/evc-calendrier/server.ts). Les
   valeurs figées de repli (base injoignable) sont dans
   src/lib/evc-calendrier/repli.ts.
   ============================================================ */

/** Slug de l'article de référence sur le calendrier détaillé. */
export const CALENDRIER_ARTICLE = 'calendrier-evc-2026-dates-epreuves-specialites';

/** Slug de l'article comparant les deux voies (ventilation des postes). */
export const VOIES_ARTICLE = 'evc-voie-interne-ou-voie-externe-comment-choisir';
