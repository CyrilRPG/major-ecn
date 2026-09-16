/**
 * Interrupteurs de mise en service des modules livrés en septembre 2026.
 *
 * Tant qu'un module est en phase de test, il n'est accessible qu'au personnel
 * connecté à l'administration (admin ou professeur) : les pages publiques et
 * les entrées de l'espace élève sont masquées pour tout le monde, quel que
 * soit l'état des données.
 *
 * Mise en service : passer la constante à `true`, déployer. Aucune migration,
 * aucune autre modification.
 */

/** EVC Arena : landing, inscription, espace participant et manches ouverts au public. */
export const ARENA_PUBLIC_ENABLED = true;

/**
 * Suivi individuel côté élève : rubrique « Mes rendez-vous » dans l'espace
 * personnel. Les liens de réservation envoyés par l'administration
 * (`/reservation/<jeton>`) fonctionnent toujours : ils ne sont accessibles
 * qu'aux candidats invités par un administrateur.
 */
export const SUIVI_STUDENT_ENABLED = false;

/**
 * Planificateur adaptatif EVC côté élève : rubrique « Mon planning » dans
 * l'espace personnel. Tant que l'interrupteur est à `false`, seuls
 * l'administrateur et les professeurs y accèdent (vue étudiant), pour la
 * recette. Le back-office /admin/planificateur est toujours disponible.
 */
export const PLAN_STUDENT_ENABLED = false;
